import { NavLink, Outlet } from 'react-router-dom'
import { DYQY_PROJECT_NAME } from '../config'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/about', label: '支队传承' },
  { to: '/species-records', label: '物种记录' },
  { to: '/reports', label: '调研成果' },
  { to: '/journey', label: '行程纪实' },
  { to: '/contact', label: '联系我们' },
]

export function SiteLayout() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="brand-wrap">
          <span className="brand-mark">滇羽</span>
          <div>
            <h1>{DYQY_PROJECT_NAME}</h1>
            <p>清华大学生态调研社会实践支队 · 2026</p>
          </div>
        </div>

        <nav className="top-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content-area">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>{DYQY_PROJECT_NAME} · 以观察守护生态，以记录连接公众。</p>
      </footer>
    </div>
  )
}
