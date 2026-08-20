import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import {
  useCreateDutyMutation,
  useDeleteDutyMutation,
  useGetDutiesQuery,
  useSeedDutiesMutation,
  useUpdateDutyMutation,
} from '../store/dutiesApi'
import { useGetPersonnelQuery } from '../store/personnelApi'
import type { DutyRecord } from '../types'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

const emptyForm = {
  personId: '',
  date: new Date().toISOString().slice(0, 10),
  dutyType: '',
  location: '',
  period: 'صباحي',
  notes: '',
}

export default function DutiesPage() {
  const { canWrite } = useAuth()
  const { data: appData } = useData()
  const { data: people = [] } = useGetPersonnelQuery()
  const { data: duties = [], isLoading, isError, refetch } = useGetDutiesQuery()
  const [createDuty, { isLoading: isCreating }] = useCreateDutyMutation()
  const [updateDuty, { isLoading: isUpdating }] = useUpdateDutyMutation()
  const [deleteDuty, { isLoading: isDeleting }] = useDeleteDutyMutation()
  const [seedDuties, { isLoading: isSeeding }] = useSeedDutiesMutation()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterPerson, setFilterPerson] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState(emptyForm)

  const peopleById = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  )

  const rows = useMemo(() => {
    return [...duties]
      .filter((d) => (filterPerson ? d.personId === filterPerson : true))
      .filter((d) => (filterDate ? d.date === filterDate : true))
      .filter((d) => (filterType ? d.dutyType === filterType : true))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [duties, filterPerson, filterDate, filterType])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      personId: people[0]?.id ?? '',
      date: new Date().toISOString().slice(0, 10),
      dutyType: appData.settings.dutyTypes[0] ?? '',
    })
    setOpen(true)
  }

  function openEdit(duty: DutyRecord) {
    setEditingId(duty.id)
    setForm({
      personId: duty.personId,
      date: duty.date,
      dutyType: duty.dutyType,
      location: duty.location,
      period: duty.period,
      notes: duty.notes,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.personId || !form.dutyType) {
      alert('الفرد ونوع الخدمة مطلوبان')
      return
    }

    try {
      if (editingId) {
        await updateDuty({ id: editingId, ...form }).unwrap()
      } else {
        await createDuty(form).unwrap()
      }
      setOpen(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر حفظ الخدمة')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف سجل الخدمة؟')) return
    try {
      await deleteDuty(id).unwrap()
    } catch {
      alert('تعذر حذف الخدمة')
    }
  }

  async function handleSeed() {
    try {
      const result = await seedDuties().unwrap()
      alert(result.message)
    } catch {
      alert('تعذر إدخال البيانات التجريبية')
    }
  }

  const saving = isCreating || isUpdating

  return (
    <div>
      <PageHeader
        title="الخدمات اليومية"
        description="سجل إلكتروني مستقل لكل خدمة — بحث بالفرد أو اليوم أو النوع"
        actions={
          <>
            {canWrite && duties.length === 0 && !isLoading && (
              <Button
                variant="secondary"
                onClick={handleSeed}
                disabled={isSeeding || people.length === 0}
              >
                {isSeeding ? 'جاري الإدخال...' : 'بيانات تجريبية'}
              </Button>
            )}
            {canWrite && (
              <Button onClick={openCreate} disabled={people.length === 0}>
                تسجيل خدمة
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 no-print">
        <Field label="تصفية بالفرد">
          <Select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
          >
            <option value="">الكل</option>
            {people.map((p) => (
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
            {appData.settings.dutyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {isLoading && <EmptyState message="جاري تحميل الخدمات..." />}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-3">تعذر تحميل الخدمات من الخادم</p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState message="لا توجد خدمات — سجّل خدمة أو استخدم البيانات التجريبية" />
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table
          headers={[
            'التاريخ',
            'الفرد',
            'نوع الخدمة',
            'المكان',
            'الفترة',
            'ملاحظات',
            'إجراء',
          ]}
        >
          {rows.map((d) => (
            <tr key={d.id}>
              <Td>{d.date}</Td>
              <Td>
                <Link
                  to={`/personnel/${d.personId}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {peopleById.get(d.personId)?.name ?? '—'}
                </Link>
              </Td>
              <Td>{d.dutyType}</Td>
              <Td>{d.location}</Td>
              <Td>{d.period}</Td>
              <Td>{d.notes || '—'}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  {canWrite && (
                    <Button variant="ghost" onClick={() => openEdit(d)}>
                      تعديل
                    </Button>
                  )}
                  {canWrite && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(d.id)}
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
        title={editingId ? 'تعديل خدمة' : 'تسجيل خدمة يومية'}
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
          <Field label="الفرد">
            <Select
              value={form.personId}
              onChange={(e) => setForm({ ...form, personId: e.target.value })}
            >
              {people.map((p) => (
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
              {appData.settings.dutyTypes.map((t) => (
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
