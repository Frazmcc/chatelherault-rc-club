import PageIntro from '../components/PageIntro'

function MeetupsPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Sunday meetup hub"
        title="Meet every Sunday morning at Chatelherault"
        description="This page is designed for quick clarity: where to meet, when to arrive, and what to bring."
      />

      <div className="split-layout">
        <article className="info-card">
          <p className="panel-label">Next run</p>
          <h2>Sunday meetup schedule</h2>
          <ul className="bullet-list">
            <li>Arrival window: 9:15am to 9:45am</li>
            <li>Rollout target: 10:00am</li>
            <li>Meet point: Chatelherault Country Park main trail access zone</li>
            <li>Weather update: published every Saturday evening</li>
          </ul>
        </article>

        <article className="info-card accent-card">
          <p className="panel-label">What to bring</p>
          <h3>Sunday prep checklist</h3>
          <ul className="bullet-list">
            <li>Fully charged packs and backup battery</li>
            <li>Basic tools and wheel nut wrench</li>
            <li>Waterproof gear for changing conditions</li>
            <li>Trail-ready 1/10 crawler setup</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default MeetupsPage
