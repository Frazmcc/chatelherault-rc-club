import { useEffect } from 'react'

function AdminEntryPage() {
  useEffect(() => {
    window.location.assign('/admin/')
  }, [])

  return (
    <section className="page-block">
      <article className="info-card">
        <p className="panel-label">Admin</p>
        <h1>Opening editor</h1>
        <p>If you are not redirected, use the button below.</p>
        <a className="button button-primary" href="/admin/">
          Open admin editor
        </a>
      </article>
    </section>
  )
}

export default AdminEntryPage
