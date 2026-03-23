type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead-text">{description}</p>
    </div>
  )
}

export default PageIntro
