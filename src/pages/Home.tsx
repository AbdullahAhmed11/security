import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

const modules = [
  {
    to: '/personnel',
    title: 'بيانات الأفراد والعساكر',
    desc: 'إنشاء ملفات الأفراد ومتابعة بياناتهم',
  },
  {
    to: '/leaves',
    title: 'الإجازات والدفعات',
    desc: 'تسجيل النزول والعودة مع السجل التاريخي',
  },
  {
    to: '/duties',
    title: 'الخدمات اليومية',
    desc: 'سجل مستقل لكل خدمة يومية',
  },
  {
    to: '/excellence',
    title: 'العسكري المتميز',
    desc: 'وقائع التميز دون مسح السجل السابق',
  },
  {
    to: '/archive',
    title: 'الأرشيف',
    desc: 'مستندات بتسلسل تلقائي وتصنيف',
  },
  {
    to: '/search',
    title: 'البحث',
    desc: 'شاشة بحث مركزية لكل البيانات',
  },
  {
    to: '/reports',
    title: 'التقارير',
    desc: 'تقارير جاهزة للمعاينة والطباعة',
  },
  {
    to: '/dashboard',
    title: 'لوحة المتابعة',
    desc: 'صورة سريعة عن موقف المنظومة',
  },
  {
    to: '/settings',
    title: 'الإعدادات',
    desc: 'إعدادات العرض والبيانات المرجعية',
  },
]

export default function Home() {
  const { data, stats } = useData()
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,#243b2e_0%,#3d5a3c_55%,#5a6e4a_100%)] px-6 py-10 text-white shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 30%)',
          }}
        />
        <div className="relative">
          <p className="text-sm text-white/75">مرحباً بك في</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {data.settings.systemName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
            منظومة متكاملة لإدارة بيانات قسم الأمن مع الاحتفاظ بتاريخ كل حركة على
            الفرد والمستند — متابعة، بحث، إحصاء، تقارير، وطباعة.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/90">
            <span>الأفراد: {stats.totalPeople}</span>
            <span>في الإجازة: {stats.onLeave}</span>
            <span>المستندات: {stats.documentsCount}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">أقسام المنظومة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-sm font-bold text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-semibold text-[var(--text)]">{m.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{m.desc}</p>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              if (confirm('هل تريد الخروج من المنظومة؟')) navigate('/')
            }}
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-red-300"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-sm font-bold text-red-700">
              10
            </div>
            <h3 className="font-semibold text-red-900">خروج من المنظومة</h3>
            <p className="mt-1 text-sm text-red-700/80">
              إنهاء الجلسة والعودة للصفحة الرئيسية
            </p>
          </button>
        </div>
      </section>
    </div>
  )
}
