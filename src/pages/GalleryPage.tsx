import PageIntro from '../components/PageIntro'
import { defaultGallery, type EntryCard, useManagedJson } from '../content/managedContent'

function GalleryPage() {
  const galleryPayload = useManagedJson<{ gallery: EntryCard[] }>('/content/gallery.json', {
    gallery: defaultGallery,
  })
  const galleryEntries = galleryPayload.gallery

  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Photos and video"
        title="Weekly gallery shell"
        description="This media section is ready for weekly crawl photos, special event clips, and build-spotlight visuals."
      />

      <div className="card-grid card-grid-three">
        {galleryEntries.map((entry) => (
          <article className="info-card" key={entry.title}>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            {entry.image && (
              <img
                className="hero-image"
                src={entry.image}
                alt={entry.imageAlt || `${entry.title} image`}
                loading="lazy"
              />
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default GalleryPage
