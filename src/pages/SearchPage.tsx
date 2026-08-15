import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Field, Input, Select } from '../components/ui/Field'
import { Badge, Card, EmptyState, PageHeader } from '../components/ui/Misc'

type Scope =
  | 'all'
  | 'people'
  | 'leaves'
  | 'duties'
  | 'excellence'
  | 'documents'

interface Hit {
  id: string
  scope: Exclude<Scope, 'all'>
  title: string
  subtitle: string
  to?: string
}

export default function SearchPage() {
  const { data, getPerson } = useData()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<Scope>('all')

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return [] as Hit[]
    const hits: Hit[] = []

    if (scope === 'all' || scope === 'people') {
      for (const p of data.people) {
        if (
          p.name.includes(q) ||
          p.number.includes(q) ||
          p.rank.includes(q) ||
          p.unit.includes(q)
        ) {
          hits.push({
            id: `person-${p.id}`,
            scope: 'people',
            title: p.name,
            subtitle: `رقم ${p.number} — ${p.rank} / ${p.unit}`,
            to: `/personnel/${p.id}`,
          })
        }
      }
    }

    if (scope === 'all' || scope === 'leaves') {
      for (const l of data.leaves) {
        const name = getPerson(l.personId)?.name ?? ''
        if (
          name.includes(q) ||
          l.batch.includes(q) ||
          l.notes.includes(q) ||
          l.departureDate.includes(q)
        ) {
          hits.push({
            id: `leave-${l.id}`,
            scope: 'leaves',
            title: `إجازة — ${name || 'فرد'}`,
            subtitle: `${l.batch} | نزول ${l.departureDate} | عودة متوقعة ${l.expectedReturnDate}`,
            to: l.personId ? `/personnel/${l.personId}` : undefined,
          })
        }
      }
    }

    if (scope === 'all' || scope === 'duties') {
      for (const d of data.duties) {
        const name = getPerson(d.personId)?.name ?? ''
        if (
          name.includes(q) ||
          d.dutyType.includes(q) ||
          d.location.includes(q) ||
          d.date.includes(q)
        ) {
          hits.push({
            id: `duty-${d.id}`,
            scope: 'duties',
            title: `خدمة — ${d.dutyType}`,
            subtitle: `${name} | ${d.date} | ${d.location} | ${d.period}`,
            to: `/personnel/${d.personId}`,
          })
        }
      }
    }

    if (scope === 'all' || scope === 'excellence') {
      for (const e of data.excellence) {
        const name = getPerson(e.personId)?.name ?? ''
        if (
          name.includes(q) ||
          e.reason.includes(q) ||
          e.status.includes(q) ||
          e.date.includes(q)
        ) {
          hits.push({
            id: `exc-${e.id}`,
            scope: 'excellence',
            title: `تميز — ${name}`,
            subtitle: `${e.date} | ${e.status} | ${e.reason}`,
            to: `/personnel/${e.personId}`,
          })
        }
      }
    }

    if (scope === 'all' || scope === 'documents') {
      for (const d of data.documents) {
        if (
          d.serialNumber.includes(q) ||
          d.subject.includes(q) ||
          d.type.includes(q) ||
          d.fromEntity.includes(q) ||
          d.toEntity.includes(q)
        ) {
          hits.push({
            id: `doc-${d.id}`,
            scope: 'documents',
            title: `${d.type} — ${d.serialNumber}`,
            subtitle: `${d.date} | ${d.subject}`,
            to: '/archive',
          })
        }
      }
    }

    return hits
  }, [query, scope, data, getPerson])

  const scopeLabel: Record<Exclude<Scope, 'all'>, string> = {
    people: 'أفراد',
    leaves: 'إجازات',
    duties: 'خدمات',
    excellence: 'تميز',
    documents: 'مستندات',
  }

  return (
    <div>
      <PageHeader
        title="البحث المركزي"
        description="شاشة واحدة للوصول السريع دون فتح كل جدول على حدة"
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <Field label="كلمة البحث">
            <Input
              placeholder="اسم، رقم، سبب تميز، موضوع مستند، تاريخ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="نطاق البحث">
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
            >
              <option value="all">الكل</option>
              <option value="people">الأفراد</option>
              <option value="leaves">الإجازات</option>
              <option value="duties">الخدمات</option>
              <option value="excellence">التميز</option>
              <option value="documents">المستندات / المحاضر / المذكرات</option>
            </Select>
          </Field>
        </div>
      </Card>

      {!query.trim() ? (
        <EmptyState message="اكتب كلمة بحث للبدء" />
      ) : results.length === 0 ? (
        <EmptyState message="لا توجد نتائج مطابقة" />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-[var(--text-muted)]">
            {results.length} نتيجة
          </p>
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="info">{scopeLabel[r.scope]}</Badge>
                  <p className="font-medium">{r.title}</p>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{r.subtitle}</p>
              </div>
              {r.to ? (
                <Link
                  to={r.to}
                  className="shrink-0 text-sm text-[var(--accent)] hover:underline"
                >
                  فتح
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
