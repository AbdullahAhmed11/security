import { useData } from '../context/DataContext'
import { Card, PageHeader } from '../components/ui/Misc'

export default function SettingsPage() {
  const { data } = useData()

  return (
    <div>
      <PageHeader
        title="الإعدادات"
        description="بيانات مرجعية للعرض في هذه النسخة التجريبية (بدون حفظ دائم)"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">المنظومة</h2>
          <p className="text-sm text-[var(--text-muted)]">اسم المنظومة</p>
          <p className="mt-1">{data.settings.systemName}</p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            الوضع الحالي: واجهة تجريبية ببيانات ثابتة في الذاكرة. أي إضافة تظهر
            أثناء الجلسة وتُفقد عند إعادة تحميل الصفحة.
          </p>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold">الرتب</h2>
          <div className="flex flex-wrap gap-2">
            {data.settings.ranks.map((r) => (
              <span
                key={r}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm"
              >
                {r}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold">الوحدات</h2>
          <div className="flex flex-wrap gap-2">
            {data.settings.units.map((u) => (
              <span
                key={u}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm"
              >
                {u}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold">التخصصات وأنواع الخدمات</h2>
          <p className="mb-2 text-sm text-[var(--text-muted)]">التخصصات</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {data.settings.specialties.map((s) => (
              <span
                key={s}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">أنواع الخدمات</p>
          <div className="flex flex-wrap gap-2">
            {data.settings.dutyTypes.map((t) => (
              <span
                key={t}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-2 font-semibold">أنواع مستندات الأرشيف</h2>
          <div className="flex flex-wrap gap-2">
            {data.settings.documentTypes.map((t) => (
              <span
                key={t}
                className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
