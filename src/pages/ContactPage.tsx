import PageIntro from '../components/PageIntro'

function ContactPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Contact"
        title="Get in touch with Chatelherault RC Club"
        description="Use this shell form layout for membership questions, collaboration requests, and meetup enquiries."
      />

      <div className="split-layout">
        <article className="info-card">
          <h2>Contact channels</h2>
          <ul className="bullet-list">
            <li>Primary social: Facebook group announcements and updates</li>
            <li>Email contact: hello@chatelheraultrc.com (configure in content phase)</li>
            <li>Meetup day enquiries: Sunday meetup page and social feed updates</li>
          </ul>
        </article>

        <article className="info-card accent-card">
          <h3>Contact form shell</h3>
          <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Name
              <input type="text" name="name" placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="Tell us what you need" />
            </label>
            <button type="submit" className="button button-primary">
              Form integration in phase 2
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

export default ContactPage
