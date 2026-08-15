import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import type { Person, PresenceStatus } from '../../types'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { Badge, PageHeader } from '../../components/ui/Misc'
import { Table, Td } from '../../components/ui/Table'

const emptyForm = {
  number: '',
  name: '',
  rank: '',
  specialty: '',
  unit: '',
  birthDate: '',
  enlistmentDate: '',
  dischargeDate: '',
  notes: '',
  presence: 'present' as PresenceStatus,
}

export default function PersonnelList() {
  const { data, addPerson, updatePerson } = useData()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return data.people
    return data.people.filter(
      (p) =>
        p.name.includes(q) ||
        p.number.includes(q) ||
        p.rank.includes(q) ||
        p.unit.includes(q),
    )
  }, [data.people, query])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      rank: data.settings.ranks[0] ?? '',
      specialty: data.settings.specialties[0] ?? '',
      unit: data.settings.units[0] ?? '',
    })
    setOpen(true)
  }

  function openEdit(person: Person) {
    setEditingId(person.id)
    setForm({
      number: person.number,
      name: person.name,
      rank: person.rank,
      specialty: person.specialty,
      unit: person.unit,
      birthDate: person.birthDate,
      enlistmentDate: person.enlistmentDate,
      dischargeDate: person.dischargeDate,
      notes: person.notes,
      presence: person.presence,
    })
    setOpen(true)
  }

  function save() {
    if (!form.number.trim() || !form.name.trim()) {
      alert('رقم الفرد والاسم مطلوبان')
      return
    }
    if (editingId) {
      updatePerson(editingId, form)
    } else {
      addPerson(form)
    }
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="بيانات الأفراد والعساكر"
        description="إنشاء ملف لكل فرد وربط جميع الحركات به"
        actions={
          <>
            <Input
              placeholder="بحث سريع..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48"
            />
            <Button onClick={openCreate}>إضافة فرد</Button>
          </>
        }
      />

      <Table
        headers={[
          'رقم الفرد',
          'الاسم',
          'الرتبة',
          'التخصص',
          'الوحدة',
          'الحالة',
          'إجراءات',
        ]}
      >
        {filtered.map((p) => (
          <tr key={p.id}>
            <Td>{p.number}</Td>
            <Td>
              <Link
                to={`/personnel/${p.id}`}
                className="font-medium text-[var(--accent)] hover:underline"
              >
                {p.name}
              </Link>
            </Td>
            <Td>{p.rank}</Td>
            <Td>{p.specialty}</Td>
            <Td>{p.unit}</Td>
            <Td>
              <Badge tone={p.presence === 'present' ? 'success' : 'warning'}>
                {p.presence === 'present' ? 'موجود' : 'في إجازة'}
              </Badge>
            </Td>
            <Td>
              <div className="flex gap-2">
                <Link to={`/personnel/${p.id}`}>
                  <Button variant="secondary">الملف</Button>
                </Link>
                <Button variant="ghost" onClick={() => openEdit(p)}>
                  تعديل
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        title={editingId ? 'تعديل بيانات الفرد' : 'إضافة فرد جديد'}
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
          <Field label="رقم الفرد">
            <Input
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </Field>
          <Field label="الاسم">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="الرتبة">
            <Select
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
            >
              {data.settings.ranks.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="السلاح / التخصص">
            <Select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            >
              {data.settings.specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="الوحدة / المكان">
            <Select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {data.settings.units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="حالة الوجود">
            <Select
              value={form.presence}
              onChange={(e) =>
                setForm({
                  ...form,
                  presence: e.target.value as PresenceStatus,
                })
              }
            >
              <option value="present">موجود</option>
              <option value="on_leave">في إجازة</option>
            </Select>
          </Field>
          <Field label="تاريخ الميلاد">
            <Input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </Field>
          <Field label="تاريخ التجنيد">
            <Input
              type="date"
              value={form.enlistmentDate}
              onChange={(e) =>
                setForm({ ...form, enlistmentDate: e.target.value })
              }
            />
          </Field>
          <Field label="تاريخ التسريح">
            <Input
              type="date"
              value={form.dischargeDate}
              onChange={(e) =>
                setForm({ ...form, dischargeDate: e.target.value })
              }
            />
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
