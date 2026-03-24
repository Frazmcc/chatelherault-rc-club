import { type MouseEvent, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { defaultSiteSettings, type SiteSettings, useManagedJson } from '../content/managedContent'

function SiteLayout() {
  const siteSettings = useManagedJson<SiteSettings>('/content/settings/site.json', defaultSiteSettings)
  const [isRootAuthenticated, setIsRootAuthenticated] = useState(false)
  const [rootEditMode, setRootEditMode] = useState(false)

  useEffect(() => {
    let active = true

    const loadAuthStatus = async () => {
      try {
        const response = await fetch('/api/root/status', {
          headers: {
            accept: 'application/json',
          },
        })
        if (!response.ok) {
          return
        }
        const body = (await response.json()) as { authenticated?: boolean }
        if (active) {
          const authenticated = Boolean(body.authenticated)
          setIsRootAuthenticated(authenticated)
          setRootEditMode(authenticated)
        }
      } catch {
        // Ignore auth status failures on public page loads.
      }
    }

    loadAuthStatus()
    return () => {
      active = false
    }
  }, [])

  const handleMainClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!isRootAuthenticated || !rootEditMode) {
      return
    }

    const target = event.target as HTMLElement
    if (target.closest('a, button, input, textarea, select, [contenteditable="true"]')) {
      return
    }

    const editableContainer = target.closest('.section-heading, .info-card, .hero-panel, .highlight-list, .card-grid article')
    if (!editableContainer) {
      return
    }

    event.preventDefault()
    window.location.assign('/admin/')
  }

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

      {isRootAuthenticated && rootEditMode ? (
        <p className="root-edit-banner">
          Root edit mode is active. Click any content box to jump into admin editing.
        </p>
      ) : null}

      <main onClickCapture={handleMainClickCapture} className={rootEditMode ? 'root-edit-active' : ''}>
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
