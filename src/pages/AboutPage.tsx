import PageIntro from '../components/PageIntro'
import { defaultAboutContent, type AboutContent, useManagedJson } from '../content/managedContent'

function AboutPage() {
  const about = useManagedJson<AboutContent>('/content/pages/about.json', defaultAboutContent)

  return (
    <section className="page-block">
      <PageIntro
        eyebrow={about.eyebrow}
        title={about.title}
        description={about.description}
      />

      <div className="split-layout">
        <article className="info-card">
          <h2>{about.valuesTitle}</h2>
          <ul className="bullet-list">
            {about.valuesList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="info-card">
          <h3>{about.newcomerTitle}</h3>
          <p>{about.newcomerBody}</p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage
