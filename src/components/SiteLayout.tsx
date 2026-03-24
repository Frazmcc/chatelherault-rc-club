import { NavLink, Outlet } from 'react-router-dom'
import { defaultSiteSettings, type SiteSettings, useManagedJson } from '../content/managedContent'

function SiteLayout() {
  const siteSettings = useManagedJson<SiteSettings>('/content/settings/site.json', defaultSiteSettings)

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="Chatelherault RC Club home">
          <img src="/brand/chattersrc.png" alt="Chatelherault RC Club logo" className="brand-logo" />
          <span>
            <strong>Chatelherault RC Club</strong>
            <small>Sunday trail crawls in Chatelherault Country Park</small>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary">
          {siteSettings.navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <p className="footer-title">{siteSettings.footerTitle}</p>
          <p className="footer-text">{siteSettings.footerText}</p>
        </div>
        <div className="footer-links" aria-label="Social links">
          {siteSettings.socialLinks.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
              {social.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default SiteLayout
