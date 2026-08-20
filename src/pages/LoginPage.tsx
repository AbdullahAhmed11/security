import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const [email, setEmail] = useState('admin@wahba.local')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-2xl font-black tracking-[0.2em] text-[var(--header)]">
            WAHBA
          </p>
          <h1 className="mt-3 text-xl font-semibold">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            المدير: صلاحيات كاملة — المشاهد: عرض فقط
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="البريد الإلكتروني">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </Field>
          <Field label="كلمة المرور">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || loading}
          >
            {submitting ? 'جاري الدخول...' : 'دخول'}
          </Button>
        </form>

        <div className="mt-6 space-y-1 rounded-lg bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
          <p>
            <strong>Admin:</strong> admin@wahba.local / Admin123!
          </p>
          <p>
            <strong>Sub-admin:</strong> subadmin@wahba.local / Viewer123!
          </p>
        </div>
      </div>
    </div>
  )
}
