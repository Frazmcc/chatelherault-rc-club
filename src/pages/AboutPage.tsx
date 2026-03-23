import PageIntro from '../components/PageIntro'

function AboutPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="About the club"
        title="A welcoming Sunday crawler community"
        description="Chatelherault RC Club focuses on trail driving, friendly meetups, and a supportive community for both newcomers and experienced hobbyists."
      />

      <div className="split-layout">
        <article className="info-card">
          <h2>What we are about</h2>
          <ul className="bullet-list">
            <li>Consistent Sunday morning trail runs</li>
            <li>Beginner-friendly atmosphere and practical support</li>
            <li>Strong focus on 1/10 crawler and trail platforms</li>
            <li>Community media, build sharing, and collaboration</li>
          </ul>
        </article>

        <article className="info-card">
          <h3>New to RC crawling?</h3>
          <p>
            You can join as you are. Bring a trail-ready rig, charge your packs, and turn up ready for an
            easygoing session across some of the best terrain in the area.
          </p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage
