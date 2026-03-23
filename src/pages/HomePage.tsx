import { Link } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'
import { highlights, shellNotice } from '../content/siteContent'

function HomePage() {
  return (
    <section className="page-block">
      <div className="hero hero-grid">
        <div>
          <PageIntro
            eyebrow="Sunday mornings in South Lanarkshire"
            title="A standout home for Chatelherault RC Club"
            description="This shell launch gives the club a polished foundation for meetup updates, event recaps, galleries, member builds, and partner networking."
          />

          <div className="hero-actions">
            <Link className="button button-primary" to="/meetups">
              View next meetup
            </Link>
            <Link className="button button-secondary" to="/gallery">
              Explore media shell
            </Link>
          </div>

          <ul className="highlight-list" aria-label="Club highlights">
            {highlights.map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-panel">
          <p className="panel-label">Shell launch status</p>
          <h2>Live-ready structure, content phase next</h2>
          <p>{shellNotice}</p>
          <img
            className="hero-image"
            src="/brand/chattersrc-alt.jpg"
            alt="Chatelherault RC Club featured branding"
            loading="lazy"
          />
        </aside>
      </div>

      <div className="card-grid card-grid-three">
        <ShellPlaceholder
          title="Weekly Meetups"
          description="Sunday details, weather status, and turnout notes will be updated by admins each week."
        />
        <ShellPlaceholder
          title="Event Features"
          description="Special crawls, collaborations, and standout recaps are structured and ready to publish."
        />
        <ShellPlaceholder
          title="Member Builds"
          description="Build stories, rig specs, and upgrade highlights will be added to a dedicated showcase."
        />
      </div>
    </section>
  )
}

export default HomePage
