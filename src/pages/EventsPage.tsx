import PageIntro from '../components/PageIntro'
import { defaultEvents, type EventEntry, useManagedJson } from '../content/managedContent'

function EventsPage() {
  const eventsPayload = useManagedJson<{ events: EventEntry[] }>('/content/events.json', {
    events: defaultEvents,
  })
  const events = eventsPayload.events

  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Special events"
        title="Club events and collaboration crawls"
        description="The event shell is ready for admin-published recaps, event schedules, and partner club collaborations."
      />

      <div className="card-grid card-grid-three">
        {events.map((entry) => (
          <article className="info-card" key={`${entry.title}-${entry.date ?? ''}`}>
            {(entry.date || entry.location) && (
              <p className="panel-label">{[entry.date, entry.location].filter(Boolean).join(' - ')}</p>
            )}
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default EventsPage
