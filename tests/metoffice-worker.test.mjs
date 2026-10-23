import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker.js'

test('active Worker caps upstream weather concurrency even for unique cache keys', async () => {
  const oldFetch = globalThis.fetch
  const oldCaches = globalThis.caches
  const inflight = []
  const usage = new Map()
  globalThis.fetch = () => new Promise(resolve => inflight.push(resolve))
  globalThis.caches = { default: {
    async match() { return undefined },
    async put() {},
  } }
  const env = {
    METOFFICE_API_KEY: 'test-only',
    METOFFICE_BUDGET_KV: {
      async get(key) { return usage.get(key) || null },
      async put(key, value) { usage.set(key, value) },
    },
  }
  const ctx = { waitUntil() {} }
  const req = id => new Request('https://example.test/api/metoffice-forecast?latitude=' + id)
  try {
    const first = worker.fetch(req(51), env, ctx)
    const second = worker.fetch(req(52), env, ctx)
    // Both requests must reach the upstream fetch before testing the cap.
    for (let n = 0; inflight.length < 2 && n < 200; n++) {
      await new Promise(resolve => setTimeout(resolve, 1))
    }
    assert.equal(inflight.length, 2)
    const rejected = await worker.fetch(req(53), env, ctx)
    assert.equal(rejected.status, 429)
    assert.equal(rejected.headers.get('retry-after'), '10')
    for (const resolve of inflight) {
      resolve(new Response('{"forecast":[]}', { status: 200 }))
    }
    assert.equal((await first).status, 200)
    assert.equal((await second).status, 200)
  } finally {
    globalThis.fetch = oldFetch
    globalThis.caches = oldCaches
  }
})
