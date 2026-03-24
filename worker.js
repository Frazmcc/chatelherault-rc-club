const DEFAULT_METOFFICE_HOURLY_URL =
  'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly'
const DEFAULT_MONTHLY_BUDGET_BYTES = 900 * 1024 * 1024
const DEFAULT_SAFETY_BUFFER_BYTES = 10 * 1024 * 1024
const DEFAULT_CACHE_TTL_SECONDS = 3 * 60 * 60
const DEFAULT_DAILY_CALL_LIMIT = 350

function buildCorsHeaders(request) {
  const origin = request.headers.get('origin') || '*'
  const allowOrigin = origin === 'null' ? '*' : origin

  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Accept',
    vary: 'Origin',
  }
}

function withCors(response, request) {
  const headers = new Headers(response.headers)
  const cors = buildCorsHeaders(request)

  Object.entries(cors).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function parseCoordinate(value, fallback) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getMonthKey() {
  const date = new Date()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${date.getUTCFullYear()}-${month}`
}

function getDayKey() {
  const date = new Date()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${date.getUTCFullYear()}-${month}-${day}`
}

async function getCurrentUsage(kv, monthKey) {
  if (!kv) return 0
  const raw = await kv.get(`metoffice:usage:${monthKey}`)
  const parsed = Number.parseInt(raw || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

async function addUsage(kv, monthKey, bytes) {
  if (!kv) return
  const current = await getCurrentUsage(kv, monthKey)
  await kv.put(`metoffice:usage:${monthKey}`, String(current + bytes))
}

async function getCurrentCalls(kv, dayKey) {
  if (!kv) return 0
  const raw = await kv.get(`metoffice:calls:${dayKey}`)
  const parsed = Number.parseInt(raw || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

async function setCurrentCalls(kv, dayKey, calls) {
  if (!kv) return
  await kv.put(`metoffice:calls:${dayKey}`, String(calls))
}

async function handleForecast(request, env, ctx) {
  const url = new URL(request.url)
  const latitude = parseCoordinate(url.searchParams.get('latitude'), 55.76278)
  const longitude = parseCoordinate(url.searchParams.get('longitude'), -4.010164)
  const monthlyBudget = parseInteger(env.METOFFICE_MONTHLY_BUDGET_BYTES, DEFAULT_MONTHLY_BUDGET_BYTES)
  const safetyBuffer = parseInteger(env.METOFFICE_BUDGET_SAFETY_BYTES, DEFAULT_SAFETY_BUFFER_BYTES)
  const cacheTtlSeconds = parseInteger(env.METOFFICE_CACHE_TTL_SECONDS, DEFAULT_CACHE_TTL_SECONDS)
  const dailyCallLimit = parseInteger(env.METOFFICE_DAILY_CALL_LIMIT, DEFAULT_DAILY_CALL_LIMIT)
  const usageKv = env.METOFFICE_BUDGET_KV

  const cacheKeyUrl = new URL(url.origin)
  cacheKeyUrl.pathname = '/api/metoffice-forecast-cache'
  cacheKeyUrl.searchParams.set('latitude', String(latitude))
  cacheKeyUrl.searchParams.set('longitude', String(longitude))
  const cacheKey = new Request(cacheKeyUrl.toString(), { method: 'GET' })
  const cache = caches.default

  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const apiKey = env.METOFFICE_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server config missing METOFFICE_API_KEY.' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  const monthKey = getMonthKey()
  const dayKey = getDayKey()
  const currentUsage = await getCurrentUsage(usageKv, monthKey)
  const currentCalls = await getCurrentCalls(usageKv, dayKey)
  const reserveThreshold = monthlyBudget - safetyBuffer

  if (currentUsage >= reserveThreshold) {
    return new Response(
      JSON.stringify({
        error: 'Met Office monthly data budget protection is active. Upstream requests are paused.',
        usageBytes: currentUsage,
        budgetBytes: monthlyBudget,
      }),
      { status: 429, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=900' } },
    )
  }

  if (currentCalls >= dailyCallLimit) {
    return new Response(
      JSON.stringify({
        error: 'Met Office daily call limit reached. Upstream requests are paused until next UTC day.',
        callsToday: currentCalls,
        callLimit: dailyCallLimit,
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=900',
          'x-metoffice-calls-today': String(currentCalls),
          'x-metoffice-call-limit': String(dailyCallLimit),
        },
      },
    )
  }

  await setCurrentCalls(usageKv, dayKey, currentCalls + 1)

  const upstreamBase = env.METOFFICE_HOURLY_URL || DEFAULT_METOFFICE_HOURLY_URL
  const upstreamUrl = `${upstreamBase}?latitude=${latitude}&longitude=${longitude}`

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: { apikey: apiKey, 'x-api-key': apiKey, accept: 'application/json' },
  })

  if (!upstreamResponse.ok) {
    const details = await upstreamResponse.text()
    return new Response(
      JSON.stringify({ error: `Met Office upstream request failed (${upstreamResponse.status}).`, details }),
      { status: upstreamResponse.status, headers: { 'content-type': 'application/json' } },
    )
  }

  const payload = await upstreamResponse.text()
  const payloadBytes = new TextEncoder().encode(payload).length

  ctx.waitUntil(addUsage(usageKv, monthKey, payloadBytes))

  const response = new Response(payload, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': `public, max-age=${cacheTtlSeconds}`,
      'x-metoffice-usage-bytes-month': String(currentUsage + payloadBytes),
      'x-metoffice-budget-bytes-month': String(monthlyBudget),
      'x-metoffice-calls-today': String(currentCalls + 1),
      'x-metoffice-call-limit': String(dailyCallLimit),
    },
  })

  ctx.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/api/metoffice-forecast') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: buildCorsHeaders(request),
        })
      }

      if (request.method !== 'GET') {
        return withCors(
          new Response(JSON.stringify({ error: 'Method not allowed.' }), {
            status: 405,
            headers: { 'content-type': 'application/json' },
          }),
          request,
        )
      }

      const forecastResponse = await handleForecast(request, env, ctx)
      return withCors(forecastResponse, request)
    }

    // Everything else is served as static assets
    return env.ASSETS.fetch(request)
  },
}
