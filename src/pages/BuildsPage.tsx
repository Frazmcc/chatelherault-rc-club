import PageIntro from '../components/PageIntro'
import { defaultBuilds, type EntryCard, useManagedJson } from '../content/managedContent'

function BuildsPage() {
  const buildsPayload = useManagedJson<{ builds: EntryCard[] }>('/content/builds.json', {
    builds: defaultBuilds,
  })
  const builds = buildsPayload.builds

  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Member builds"
        title="Build showcase shell"
        description="A dedicated area for member rigs, upgrades, and setup stories, prepared for admin publishing."
      />

      <div className="card-grid card-grid-three">
        {builds.map((entry) => (
          <article className="info-card" key={entry.title}>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BuildsPage
