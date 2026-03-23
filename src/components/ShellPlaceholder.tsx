type ShellPlaceholderProps = {
  title: string
  description: string
}

function ShellPlaceholder({ title, description }: ShellPlaceholderProps) {
  return (
    <article className="info-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="placeholder-note">Content section ready. Final posts and media will be published by admins.</p>
    </article>
  )
}

export default ShellPlaceholder
