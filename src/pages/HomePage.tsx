import { Link } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'
import { defaultHomeContent, type HomeContent, useManagedJson } from '../content/managedContent'

function HomePage() {
  const home = useManagedJson<HomeContent>('/content/pages/home.json', defaultHomeContent)

  return (
    <section className="page-block">
      <div className="hero hero-grid">
        <div>
          <PageIntro
            eyebrow={home.eyebrow}
            title={home.title}
            description={home.description}
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
            {home.highlights.map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-panel">
          <p className="panel-label">{home.shellLabel}</p>
          <h2>{home.panelTitle}</h2>
          <p>{home.panelBody}</p>
          <img
            className="hero-image"
            src={home.heroImageSrc}
            alt={home.heroImageAlt}
            loading="lazy"
          />
        </aside>
      </div>

      <div className="card-grid card-grid-three">
        {home.featureCards.map((card) => (
          <ShellPlaceholder key={card.title} title={card.title} description={card.description} />
        ))}
      </div>
    </section>
  )
}

export default HomePage
