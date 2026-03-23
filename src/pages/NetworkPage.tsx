import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'

function NetworkPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Club network"
        title="Connect with other RC clubs"
        description="This section is structured for partner clubs, collaboration events, and regional crawler connections."
      />

      <div className="card-grid card-grid-three">
        <ShellPlaceholder
          title="Partner directory"
          description="Club profiles and regional links will be curated in this directory."
        />
        <ShellPlaceholder
          title="Collaboration days"
          description="Joint trail events and multi-club sessions will be tracked here."
        />
        <ShellPlaceholder
          title="Contact routes"
          description="Direct channels for inter-club planning and event coordination are ready."
        />
      </div>
    </section>
  )
}

export default NetworkPage
