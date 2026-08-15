import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

export default function DutiesPage() {
  const { data, getPerson, addDuty } = useData()
  const [open, setOpen] = useState(false)
  const [filterPerson, setFilterPerson] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({
    personId: '',
    date: new Date().toISOString().slice(0, 10),
    dutyType: '',
    location: '',
    period: 'صباحي',
    notes: '',
  })

  const rows = useMemo(() => {
    return [...data.duties]
      .filter((d) => (filterPerson ? d.personId === filterPerson : true))
      .filter((d) => (filterDate ? d.date === filterDate : true))
      .filter((d) => (filterType ? d.dutyType === filterType : true))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [data.duties, filterPerson, filterDate, filterType])

  function save() {
    if (!form.personId || !form.dutyType) {
      alert('الفرد ونوع الخدمة مطلوبان')
      return
    }
    addDuty(form)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="الخدمات اليومية"
        description="سجل إلكتروني مستقل لكل خدمة — بحث بالفرد أو اليوم أو النوع"
        actions={<Button onClick={() => {
          setForm({
            personId: data.people[0]?.id ?? '',
            date: new Date().toISOString().slice(0, 10),
            dutyType: data.settings.dutyTypes[0] ?? '',
            location: '',
            period: 'صباحي',
            notes: '',
          })
          setOpen(true)
        }}>تسجيل خدمة</Button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 no-print">
        <Field label="تصفية بالفرد">
          <Select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
          >
            <option value="">الكل</option>
            {data.people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="تصفية بالتاريخ">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Field>
        <Field label="تصفية بنوع الخدمة">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">الكل</option>
            {data.settings.dutyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Table headers={['التاريخ', 'الفرد', 'نوع الخدمة', 'المكان', 'الفترة', 'ملاحظات']}>
        {rows.map((d) => (
          <tr key={d.id}>
            <Td>{d.date}</Td>
            <Td>
              <Link
                to={`/personnel/${d.personId}`}
                className="text-[var(--accent)] hover:underline"
              >
                {getPerson(d.personId)?.name ?? '—'}
              </Link>
            </Td>
            <Td>{d.dutyType}</Td>
            <Td>{d.location}</Td>
            <Td>{d.period}</Td>
            <Td>{d.notes || '—'}</Td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        title="تسجيل خدمة يومية"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الفرد">
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
          <Field label="التاريخ">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="نوع الخدمة">
            <Select
              value={form.dutyType}
              onChange={(e) => setForm({ ...form, dutyType: e.target.value })}
            >
              {data.settings.dutyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="مكان الخدمة">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="الفترة">
            <Select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            >
              <option value="صباحي">صباحي</option>
              <option value="مسائي">مسائي</option>
              <option value="ليلي">ليلي</option>
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
