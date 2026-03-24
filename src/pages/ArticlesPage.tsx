import PageIntro from '../components/PageIntro'
import { defaultArticles, type ArticleEntry, useManagedJson } from '../content/managedContent'

function ArticlesPage() {
  const articlesPayload = useManagedJson<{ articles: ArticleEntry[] }>('/content/articles.json', {
    articles: defaultArticles,
  })
  const articles = articlesPayload.articles

  return (
    <section className="page-block">
      <PageIntro
        eyebrow="Club news"
        title="Posts, articles, and updates"
        description="Admins can publish updates here from the /admin editor without touching code."
      />

      <div className="card-grid card-grid-three">
        {articles.map((article) => (
          <article className="info-card" key={article.slug}>
            <p className="panel-label">{article.date}</p>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ArticlesPage
