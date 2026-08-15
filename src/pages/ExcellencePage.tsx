import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

export default function ExcellencePage() {
  const { data, getPerson, addExcellence } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    personId: '',
    status: 'تميز أداء',
    reason: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const rows = useMemo(
    () => [...data.excellence].sort((a, b) => b.date.localeCompare(a.date)),
    [data.excellence],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of data.excellence) {
      map.set(e.personId, (map.get(e.personId) ?? 0) + 1)
    }
    return map
  }, [data.excellence])

  function save() {
    if (!form.personId || !form.reason.trim()) {
      alert('الفرد وسبب التميز مطلوبان')
      return
    }
    addExcellence(form)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="العسكري المتميز"
        description="كل واقعة تميز تُسجَّل مستقلة — لا تعديل على الوقائع السابقة"
        actions={
          <Button
            onClick={() => {
              setForm({
                personId: data.people[0]?.id ?? '',
                status: 'تميز أداء',
                reason: '',
                date: new Date().toISOString().slice(0, 10),
                notes: '',
              })
              setOpen(true)
            }}
          >
            تسجيل واقعة تميز
          </Button>
        }
      />

      <Table
        headers={[
          'التاريخ',
          'العسكري',
          'حالة التميز',
          'السبب',
          'مرات التميز',
          'ملاحظات',
        ]}
      >
        {rows.map((e) => (
          <tr key={e.id}>
            <Td>{e.date}</Td>
            <Td>
              <Link
                to={`/personnel/${e.personId}`}
                className="text-[var(--accent)] hover:underline"
              >
                {getPerson(e.personId)?.name ?? '—'}
              </Link>
            </Td>
            <Td>{e.status}</Td>
            <Td>{e.reason}</Td>
            <Td>{counts.get(e.personId) ?? 1}</Td>
            <Td>{e.notes || '—'}</Td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        title="واقعة تميز جديدة"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ الواقعة</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          سيتم إنشاء سجل جديد دون تعديل أي تميز سابق لنفس العسكري.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم العسكري">
            <Select
              value={form.personId}
              onChange={(e) => setForm({ ...form, personId: e.target.value })}
            >
              {data.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="حالة التميز">
            <Input
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </Field>
          <Field label="تاريخ التميز">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="سبب التميز">
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="ملاحظات إضافية">
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
