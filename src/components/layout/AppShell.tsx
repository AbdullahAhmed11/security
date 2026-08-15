import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useData } from '../../context/DataContext'

const navItems = [
  { to: '/', label: 'الرئيسية' },
  { to: '/dashboard', label: 'لوحة المتابعة' },
  { to: '/personnel', label: 'الأفراد' },
  { to: '/leaves', label: 'الإجازات' },
  { to: '/duties', label: 'الخدمات' },
  { to: '/excellence', label: 'التميز' },
  { to: '/archive', label: 'الأرشيف' },
  { to: '/search', label: 'البحث' },
  { to: '/reports', label: 'التقارير' },
  { to: '/settings', label: 'الإعدادات' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useData()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--text)]">
      <header className="no-print border-b border-[var(--border)] bg-[var(--header)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-white/70">منظومة إلكترونية متكاملة</p>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {data.settings.systemName}
            </h1>
          </div>
          {!isHome ? (
            <Link
              to="/"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              الرئيسية
            </Link>
          ) : null}
        </div>
        {!isHome ? (
          <nav className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2">
              {navItems.map((item) => {
                const active =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${
                      active
                        ? 'bg-white text-[var(--header)]'
                        : 'text-white/85 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        ) : null}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
