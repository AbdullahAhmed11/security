import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import type { Person, PresenceStatus } from '../../types'
import {
  useCreatePersonMutation,
  useDeletePersonMutation,
  useGetPersonnelQuery,
  useSeedPersonnelMutation,
  useUpdatePersonMutation,
} from '../../store/personnelApi'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { Badge, EmptyState, PageHeader } from '../../components/ui/Misc'
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
  const { canWrite } = useAuth()
  const { data: appData } = useData()
  const { data: people = [], isLoading, isError, error, refetch } =
    useGetPersonnelQuery()
  const [createPerson, { isLoading: isCreating }] = useCreatePersonMutation()
  const [updatePerson, { isLoading: isUpdating }] = useUpdatePersonMutation()
  const [deletePerson, { isLoading: isDeleting }] = useDeletePersonMutation()
  const [seedPersonnel, { isLoading: isSeeding }] = useSeedPersonnelMutation()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return people
    return people.filter(
      (p) =>
        p.name.includes(q) ||
        p.number.includes(q) ||
        p.rank.includes(q) ||
        p.unit.includes(q),
    )
  }, [people, query])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      rank: appData.settings.ranks[0] ?? '',
      specialty: appData.settings.specialties[0] ?? '',
      unit: appData.settings.units[0] ?? '',
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

  async function save() {
    if (!form.number.trim() || !form.name.trim()) {
      alert('رقم الفرد والاسم مطلوبان')
      return
    }

    try {
      if (editingId) {
        await updatePerson({ id: editingId, ...form }).unwrap()
      } else {
        await createPerson(form).unwrap()
      }
      setOpen(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر حفظ بيانات الفرد')
    }
  }

  async function handleDelete(person: Person) {
    if (!confirm(`حذف الفرد «${person.name}»؟`)) return
    try {
      await deletePerson(person.id).unwrap()
    } catch {
      alert('تعذر حذف الفرد')
    }
  }

  async function handleSeed() {
    try {
      const result = await seedPersonnel().unwrap()
      alert(result.message)
    } catch {
      alert('تعذر إدخال البيانات التجريبية')
    }
  }

  const saving = isCreating || isUpdating

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
            {canWrite && people.length === 0 && !isLoading && (
              <Button
                variant="secondary"
                onClick={handleSeed}
                disabled={isSeeding}
              >
                {isSeeding ? 'جاري الإدخال...' : 'بيانات تجريبية'}
              </Button>
            )}
            {canWrite && <Button onClick={openCreate}>إضافة فرد</Button>}
          </>
        }
      />

      {isLoading && <EmptyState message="جاري تحميل الأفراد..." />}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-2">
            تعذر الاتصال بالخادم. تأكد أن الـ API يعمل على{' '}
            <code>https://securityback.onrender.com</code>
          </p>
          <p className="mb-3 text-xs opacity-80">
            {error && 'status' in error ? `status: ${error.status}` : null}
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState message="لا يوجد أفراد — أضف فرداً أو استخدم البيانات التجريبية" />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
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
                <div className="flex flex-wrap gap-2">
                  <Link to={`/personnel/${p.id}`}>
                    <Button variant="secondary">الملف</Button>
                  </Link>
                  {canWrite && (
                    <Button variant="ghost" onClick={() => openEdit(p)}>
                      تعديل
                    </Button>
                  )}
                  {canWrite && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(p)}
                      disabled={isDeleting}
                    >
                      حذف
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={open}
        title={editingId ? 'تعديل بيانات الفرد' : 'إضافة فرد جديد'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
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
              {appData.settings.ranks.map((r) => (
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
              {appData.settings.specialties.map((s) => (
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
              {appData.settings.units.map((u) => (
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
