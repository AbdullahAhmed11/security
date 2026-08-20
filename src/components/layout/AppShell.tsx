import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

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
  const { user, canWrite, logout } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--text)]">
      <div className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-2)] no-print">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:py-4">
          <p className="text-2xl font-black tracking-[0.2em] text-[var(--header)] sm:text-3xl md:text-4xl">
            WAHBA
          </p>
        </div>
      </div>
      <header className="no-print border-b border-[var(--border)] bg-[var(--header)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-white/70">منظومة إلكترونية متكاملة</p>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {data.settings.systemName}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user ? (
              <div className="hidden text-left text-xs sm:block">
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-white/70">
                  {canWrite ? 'مدير — صلاحيات كاملة' : 'مشاهد — عرض فقط'}
                </p>
              </div>
            ) : null}
            {!isHome ? (
              <Link
                to="/"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
              >
                الرئيسية
              </Link>
            ) : null}
            <Button
              variant="secondary"
              className="!bg-white/10 !text-white hover:!bg-white/20"
              onClick={logout}
            >
              خروج
            </Button>
          </div>
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
      {!canWrite ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 no-print">
          حساب مشاهدة فقط — يمكنك تصفح الصفحات والجداول دون إضافة أو تعديل أو
          حذف
        </div>
      ) : null}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
