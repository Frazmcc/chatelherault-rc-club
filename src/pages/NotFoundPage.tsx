import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-block">
      <article className="info-card">
        <p className="panel-label">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist in this shell build.</p>
        <Link className="button button-primary" to="/">
          Back to home
        </Link>
      </article>
    </section>
  )
}

export default NotFoundPage
