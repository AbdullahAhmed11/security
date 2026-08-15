import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import type { DocumentType } from '../types'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

export default function ArchivePage() {
  const { data, getPerson, addDocument } = useData()
  const [open, setOpen] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'مذكرة' as DocumentType,
    fromEntity: '',
    toEntity: '',
    subject: '',
    personId: '' as string,
    notes: '',
  })

  const rows = useMemo(() => {
    const q = query.trim()
    return [...data.documents]
      .filter((d) => (filterType ? d.type === filterType : true))
      .filter((d) =>
        !q
          ? true
          : d.serialNumber.includes(q) ||
            d.subject.includes(q) ||
            d.fromEntity.includes(q) ||
            d.toEntity.includes(q),
      )
      .sort((a, b) => b.serialNumber.localeCompare(a.serialNumber))
  }, [data.documents, filterType, query])

  function save() {
    if (!form.subject.trim()) {
      alert('موضوع المستند مطلوب')
      return
    }
    addDocument({
      date: form.date,
      type: form.type,
      fromEntity: form.fromEntity,
      toEntity: form.toEntity,
      subject: form.subject,
      personId: form.personId || null,
      notes: form.notes,
    })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="الأرشيف الإلكتروني"
        description="استلام → تسجيل → تصنيف → رقم تسلسلي تلقائي → بحث لاحق"
        actions={
          <Button
            onClick={() => {
              setForm({
                date: new Date().toISOString().slice(0, 10),
                type: 'مذكرة',
                fromEntity: '',
                toEntity: '',
                subject: '',
                personId: '',
                notes: '',
              })
              setOpen(true)
            }}
          >
            تسجيل مستند
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 no-print">
        <Field label="بحث">
          <Input
            placeholder="رقم / موضوع / جهة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
        <Field label="نوع المستند">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">الكل</option>
            {data.settings.documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Table
        headers={[
          'الرقم التسلسلي',
          'التاريخ',
          'النوع',
          'من',
          'إلى',
          'الموضوع',
          'الشخص المرتبط',
          'ملاحظات',
        ]}
      >
        {rows.map((d) => (
          <tr key={d.id}>
            <Td className="font-medium">{d.serialNumber}</Td>
            <Td>{d.date}</Td>
            <Td>{d.type}</Td>
            <Td>{d.fromEntity}</Td>
            <Td>{d.toEntity}</Td>
            <Td>{d.subject}</Td>
            <Td>
              {d.personId ? (
                <Link
                  to={`/personnel/${d.personId}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {getPerson(d.personId)?.name ?? '—'}
                </Link>
              ) : (
                '—'
              )}
            </Td>
            <Td>{d.notes || '—'}</Td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        title="تسجيل مستند جديد"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ وإعطاء رقم تسلسلي</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="تاريخ المستند">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="نوع المستند">
            <Select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as DocumentType })
              }
            >
              {data.settings.documentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="الجهة الوارد منها">
            <Input
              value={form.fromEntity}
              onChange={(e) => setForm({ ...form, fromEntity: e.target.value })}
            />
          </Field>
          <Field label="الجهة المرسل إليها">
            <Input
              value={form.toEntity}
              onChange={(e) => setForm({ ...form, toEntity: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="الموضوع">
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </Field>
          </div>
          <Field label="الشخص المرتبط (اختياري)">
            <Select
              value={form.personId}
              onChange={(e) => setForm({ ...form, personId: e.target.value })}
            >
              <option value="">بدون</option>
              {data.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="ملاحظات">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}
