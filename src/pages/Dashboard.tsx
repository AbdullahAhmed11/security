import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { PageHeader, StatCard, Card } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'
import { Badge } from '../components/ui/Misc'

export default function Dashboard() {
  const { data, stats, getPerson } = useData()
  const pendingLeaves = data.leaves.filter((l) => l.returnStatus === 'pending')
  const recentDuties = [...data.duties]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title="لوحة المتابعة"
        description="صورة سريعة عن موقف المنظومة بمجرد الفتح"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الأفراد" value={stats.totalPeople} />
        <StatCard label="الموجودون" value={stats.present} />
        <StatCard label="في الإجازة" value={stats.onLeave} />
        <StatCard label="العائدون (سجل)" value={stats.returnedRecently} />
        <StatCard
          label="العسكريون المتميزون"
          value={stats.distinctExcellencePeople}
          hint={`${stats.excellenceCount} واقعة تميز`}
        />
        <StatCard label="الخدمات المسجلة" value={stats.dutiesCount} />
        <StatCard label="مستندات الأرشيف" value={stats.documentsCount} />
        <StatCard
          label="إجازات بانتظار العودة"
          value={pendingLeaves.length}
          hint="تحتاج متابعة"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">إجازات تحتاج متابعة</h2>
            <Link to="/leaves" className="text-sm text-[var(--accent)]">
              عرض الكل
            </Link>
          </div>
          {pendingLeaves.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">لا توجد إجازات معلقة</p>
          ) : (
            <ul className="space-y-2">
              {pendingLeaves.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm"
                >
                  <span>{getPerson(l.personId)?.name ?? '—'}</span>
                  <Badge tone="warning">عودة متوقعة {l.expectedReturnDate}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">أحدث الخدمات</h2>
            <Link to="/duties" className="text-sm text-[var(--accent)]">
              عرض الكل
            </Link>
          </div>
          <Table headers={['التاريخ', 'الفرد', 'النوع', 'المكان']}>
            {recentDuties.map((d) => (
              <tr key={d.id}>
                <Td>{d.date}</Td>
                <Td>{getPerson(d.personId)?.name ?? '—'}</Td>
                <Td>{d.dutyType}</Td>
                <Td>{d.location}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  )
}
