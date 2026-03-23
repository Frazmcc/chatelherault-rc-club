import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'

function BuildsPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Member builds"
        title="Build showcase shell"
        description="A dedicated area for member rigs, upgrades, and setup stories, prepared for admin publishing."
      />

      <div className="card-grid card-grid-three">
        <ShellPlaceholder
          title="Featured rigs"
          description="Standout member crawlers will be highlighted with full spec summaries."
        />
        <ShellPlaceholder
          title="Mod breakdowns"
          description="Suspension, drivetrain, and bodywork upgrades will be documented as easy read cards."
        />
        <ShellPlaceholder
          title="Build stories"
          description="Member write-ups will explain setup goals, trail performance, and lessons learned."
        />
      </div>
    </section>
  )
}

export default BuildsPage
