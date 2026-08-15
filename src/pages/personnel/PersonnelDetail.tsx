import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Badge, Card, EmptyState, PageHeader } from '../../components/ui/Misc'
import { Table, Td } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'

type Tab = 'leaves' | 'duties' | 'excellence' | 'documents'

const leaveStatusLabel: Record<string, string> = {
  pending: 'بانتظار العودة',
  on_time: 'في الموعد',
  late: 'متأخر',
  extended: 'ممدد',
  deducted: 'خصم',
}

export default function PersonnelDetail() {
  const { id } = useParams()
  const { getPerson, data } = useData()
  const person = id ? getPerson(id) : undefined
  const [tab, setTab] = useState<Tab>('leaves')

  const leaves = useMemo(
    () => data.leaves.filter((l) => l.personId === id),
    [data.leaves, id],
  )
  const duties = useMemo(
    () => data.duties.filter((d) => d.personId === id),
    [data.duties, id],
  )
  const excellence = useMemo(
    () => data.excellence.filter((e) => e.personId === id),
    [data.excellence, id],
  )
  const documents = useMemo(
    () => data.documents.filter((d) => d.personId === id),
    [data.documents, id],
  )

  if (!person) {
    return (
      <div>
        <PageHeader title="ملف الفرد" />
        <EmptyState message="الفرد غير موجود" />
        <div className="mt-4">
          <Link to="/personnel">
            <Button variant="secondary">العودة للقائمة</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'leaves', label: 'الإجازات', count: leaves.length },
    { id: 'duties', label: 'الخدمات', count: duties.length },
    { id: 'excellence', label: 'التميز', count: excellence.length },
    { id: 'documents', label: 'المستندات', count: documents.length },
  ]

  const currentLeave = leaves.find((l) => l.returnStatus === 'pending')

  return (
    <div>
      <PageHeader
        title={person.name}
        description={`رقم الفرد: ${person.number} — ${person.rank} / ${person.unit}`}
        actions={
          <Link to="/personnel">
            <Button variant="secondary">كل الأفراد</Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">البيانات الأساسية</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">الرتبة</dt>
              <dd>{person.rank}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">التخصص</dt>
              <dd>{person.specialty}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">الوحدة</dt>
              <dd>{person.unit}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">الحالة</dt>
              <dd>
                <Badge tone={person.presence === 'present' ? 'success' : 'warning'}>
                  {person.presence === 'present' ? 'موجود' : 'في إجازة'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">تاريخ الميلاد</dt>
              <dd>{person.birthDate || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">تاريخ التجنيد</dt>
              <dd>{person.enlistmentDate || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">تاريخ التسريح</dt>
              <dd>{person.dischargeDate || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">ملاحظات</dt>
              <dd>{person.notes || '—'}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">ملخص الملف</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-[var(--text-muted)]">إجازات سابقة</span>
              <span>{leaves.filter((l) => l.returnStatus !== 'pending').length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text-muted)]">إجازة حالية</span>
              <span>{currentLeave ? currentLeave.departureDate : 'لا يوجد'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text-muted)]">الخدمات</span>
              <span>{duties.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text-muted)]">مرات التميز</span>
              <span>{excellence.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text-muted)]">المستندات</span>
              <span>{documents.length}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 no-print">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === t.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white border border-[var(--border)]'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'leaves' &&
        (leaves.length === 0 ? (
          <EmptyState message="لا توجد إجازات مسجلة لهذا الفرد" />
        ) : (
          <Table
            headers={[
              'الدفعة',
              'النزول',
              'المدة',
              'العودة المتوقعة',
              'العودة الفعلية',
              'الحالة',
              'ملاحظات',
            ]}
          >
            {[...leaves]
              .sort((a, b) => b.departureDate.localeCompare(a.departureDate))
              .map((l) => (
                <tr key={l.id}>
                  <Td>{l.batch}</Td>
                  <Td>{l.departureDate}</Td>
                  <Td>{l.durationDays} يوم</Td>
                  <Td>{l.expectedReturnDate}</Td>
                  <Td>{l.actualReturnDate || '—'}</Td>
                  <Td>
                    <Badge
                      tone={
                        l.returnStatus === 'pending'
                          ? 'warning'
                          : l.returnStatus === 'on_time'
                            ? 'success'
                            : 'info'
                      }
                    >
                      {leaveStatusLabel[l.returnStatus]}
                    </Badge>
                  </Td>
                  <Td className="max-w-48 truncate">{l.notes || '—'}</Td>
                </tr>
              ))}
          </Table>
        ))}

      {tab === 'duties' &&
        (duties.length === 0 ? (
          <EmptyState message="لا توجد خدمات مسجلة لهذا الفرد" />
        ) : (
          <Table headers={['التاريخ', 'النوع', 'المكان', 'الفترة', 'ملاحظات']}>
            {[...duties]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((d) => (
                <tr key={d.id}>
                  <Td>{d.date}</Td>
                  <Td>{d.dutyType}</Td>
                  <Td>{d.location}</Td>
                  <Td>{d.period}</Td>
                  <Td>{d.notes || '—'}</Td>
                </tr>
              ))}
          </Table>
        ))}

      {tab === 'excellence' &&
        (excellence.length === 0 ? (
          <EmptyState message="لا توجد وقائع تميز لهذا الفرد" />
        ) : (
          <Table headers={['التاريخ', 'حالة التميز', 'السبب', 'ملاحظات']}>
            {[...excellence]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e, idx) => (
                <tr key={e.id}>
                  <Td>
                    <span className="ml-2 text-[var(--text-muted)]">
                      واقعة {excellence.length - idx}
                    </span>
                    {e.date}
                  </Td>
                  <Td>{e.status}</Td>
                  <Td>{e.reason}</Td>
                  <Td>{e.notes || '—'}</Td>
                </tr>
              ))}
          </Table>
        ))}

      {tab === 'documents' &&
        (documents.length === 0 ? (
          <EmptyState message="لا توجد مستندات مرتبطة بهذا الفرد" />
        ) : (
          <Table headers={['الرقم', 'التاريخ', 'النوع', 'الموضوع', 'ملاحظات']}>
            {documents.map((d) => (
              <tr key={d.id}>
                <Td>{d.serialNumber}</Td>
                <Td>{d.date}</Td>
                <Td>{d.type}</Td>
                <Td>{d.subject}</Td>
                <Td>{d.notes || '—'}</Td>
              </tr>
            ))}
          </Table>
        ))}
    </div>
  )
}
