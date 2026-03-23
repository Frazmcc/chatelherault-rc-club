import PageIntro from '../components/PageIntro'
import ShellPlaceholder from '../components/ShellPlaceholder'

function GalleryPage() {
  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Photos and video"
        title="Weekly gallery shell"
        description="This media section is ready for weekly crawl photos, special event clips, and build-spotlight visuals."
      />

      <div className="card-grid card-grid-three">
        <ShellPlaceholder
          title="Weekly crawl albums"
          description="Regular Sunday photos will be grouped and published as weekly sets."
        />
        <ShellPlaceholder
          title="Event media"
          description="Special event coverage and short action clips will live in this stream."
        />
        <ShellPlaceholder
          title="Build feature media"
          description="Close-up shots of rigs and modification details will support member build stories."
        />
      </div>
    </section>
  )
}

export default GalleryPage
