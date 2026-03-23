import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'

function EventsPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Special events"
        title="Club events and collaboration crawls"
        description="The event shell is ready for admin-published recaps, event schedules, and partner club collaborations."
      />

      <div className="card-grid card-grid-three">
        <ShellPlaceholder
          title="Upcoming features"
          description="Upcoming collaboration runs and themed event days will appear here."
        />
        <ShellPlaceholder
          title="Recent recaps"
          description="Event recap posts with photo highlights and route notes will be published in this block."
        />
        <ShellPlaceholder
          title="Community updates"
          description="Announcements about charity runs and club milestones are ready for rollout."
        />
      </div>
    </section>
  )
}

export default EventsPage
