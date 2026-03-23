import { NavLink, Outlet } from 'react-router-dom'
import { navItems, socialLinks } from '../content/siteContent'

function SiteLayout() {
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
          {navItems.map((item) => (
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
          <p className="footer-title">Chatelherault RC Club</p>
          <p className="footer-text">Built for meetups, media, builds, and club networking.</p>
        </div>
        <div className="footer-links" aria-label="Social links">
          {socialLinks.map((social) => (
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
