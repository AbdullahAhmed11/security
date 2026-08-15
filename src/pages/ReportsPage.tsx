import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { PrintReport } from '../components/PrintReport'
import { Field, Input, Select } from '../components/ui/Field'
import { Card, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

type ReportKey =
  | 'people'
  | 'leaves'
  | 'duties'
  | 'excellence'
  | 'archive'

const reportTitles: Record<ReportKey, string> = {
  people: 'تقرير الأفراد',
  leaves: 'تقرير الإجازات',
  duties: 'تقرير الخدمات',
  excellence: 'تقرير العسكري المتميز',
  archive: 'تقرير الأرشيف',
}

export default function ReportsPage() {
  const { data, getPerson } = useData()
  const [report, setReport] = useState<ReportKey>('people')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [personId, setPersonId] = useState('')

  const excellenceCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of data.excellence) {
      map.set(e.personId, (map.get(e.personId) ?? 0) + 1)
    }
    return map
  }, [data.excellence])

  function inRange(date: string) {
    if (dateFrom && date < dateFrom) return false
    if (dateTo && date > dateTo) return false
    return true
  }

  return (
    <div>
      <PageHeader
        title="التقارير والطباعة"
        description="تقارير جاهزة للمعاينة والطباعة من المتصفح"
      />

      <Card className="mb-6 no-print">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="نوع التقرير">
            <Select
              value={report}
              onChange={(e) => setReport(e.target.value as ReportKey)}
            >
              {(Object.keys(reportTitles) as ReportKey[]).map((k) => (
                <option key={k} value={k}>
                  {reportTitles[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="من تاريخ">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Field>
          <Field label="إلى تاريخ">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Field>
          <Field label="فرد (اختياري)">
            <Select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">الكل</option>
              {data.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <PrintReport title={reportTitles[report]}>
        {report === 'people' && (
          <Table
            headers={[
              'رقم الفرد',
              'الاسم',
              'الرتبة',
              'التخصص',
              'الوحدة',
              'الحالة',
            ]}
          >
            {data.people
              .filter((p) => (personId ? p.id === personId : true))
              .map((p) => (
                <tr key={p.id}>
                  <Td>{p.number}</Td>
                  <Td>{p.name}</Td>
                  <Td>{p.rank}</Td>
                  <Td>{p.specialty}</Td>
                  <Td>{p.unit}</Td>
                  <Td>{p.presence === 'present' ? 'موجود' : 'في إجازة'}</Td>
                </tr>
              ))}
          </Table>
        )}

        {report === 'leaves' && (
          <Table
            headers={[
              'الاسم',
              'الدفعة',
              'تاريخ النزول',
              'تاريخ العودة المتوقع',
              'تاريخ العودة الفعلي',
              'الحالة',
            ]}
          >
            {data.leaves
              .filter((l) => (personId ? l.personId === personId : true))
              .filter((l) => inRange(l.departureDate))
              .map((l) => (
                <tr key={l.id}>
                  <Td>{getPerson(l.personId)?.name ?? '—'}</Td>
                  <Td>{l.batch}</Td>
                  <Td>{l.departureDate}</Td>
                  <Td>{l.expectedReturnDate}</Td>
                  <Td>{l.actualReturnDate || '—'}</Td>
                  <Td>{l.returnStatus}</Td>
                </tr>
              ))}
          </Table>
        )}

        {report === 'duties' && (
          <Table headers={['التاريخ', 'الفرد', 'نوع الخدمة', 'المكان', 'الفترة']}>
            {data.duties
              .filter((d) => (personId ? d.personId === personId : true))
              .filter((d) => inRange(d.date))
              .map((d) => (
                <tr key={d.id}>
                  <Td>{d.date}</Td>
                  <Td>{getPerson(d.personId)?.name ?? '—'}</Td>
                  <Td>{d.dutyType}</Td>
                  <Td>{d.location}</Td>
                  <Td>{d.period}</Td>
                </tr>
              ))}
          </Table>
        )}

        {report === 'excellence' && (
          <Table
            headers={[
              'الاسم',
              'سبب التميز',
              'تاريخ التميز',
              'حالة التميز',
              'عدد مرات التميز',
            ]}
          >
            {data.excellence
              .filter((e) => (personId ? e.personId === personId : true))
              .filter((e) => inRange(e.date))
              .map((e) => (
                <tr key={e.id}>
                  <Td>{getPerson(e.personId)?.name ?? '—'}</Td>
                  <Td>{e.reason}</Td>
                  <Td>{e.date}</Td>
                  <Td>{e.status}</Td>
                  <Td>{excellenceCounts.get(e.personId) ?? 1}</Td>
                </tr>
              ))}
          </Table>
        )}

        {report === 'archive' && (
          <Table headers={['الرقم', 'التاريخ', 'النوع', 'الموضوع', 'من', 'إلى']}>
            {data.documents
              .filter((d) => inRange(d.date))
              .map((d) => (
                <tr key={d.id}>
                  <Td>{d.serialNumber}</Td>
                  <Td>{d.date}</Td>
                  <Td>{d.type}</Td>
                  <Td>{d.subject}</Td>
                  <Td>{d.fromEntity}</Td>
                  <Td>{d.toEntity}</Td>
                </tr>
              ))}
          </Table>
        )}
      </PrintReport>
    </div>
  )
}
