import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useCreateExcellenceMutation,
  useDeleteExcellenceMutation,
  useGetExcellenceQuery,
  useSeedExcellenceMutation,
} from '../store/excellenceApi'
import { useGetPersonnelQuery } from '../store/personnelApi'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

export default function ExcellencePage() {
  const { canWrite } = useAuth()
  const { data: people = [] } = useGetPersonnelQuery()
  const {
    data: excellence = [],
    isLoading,
    isError,
    refetch,
  } = useGetExcellenceQuery()
  const [createExcellence, { isLoading: isCreating }] =
    useCreateExcellenceMutation()
  const [deleteExcellence, { isLoading: isDeleting }] =
    useDeleteExcellenceMutation()
  const [seedExcellence, { isLoading: isSeeding }] = useSeedExcellenceMutation()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    personId: '',
    status: 'تميز أداء',
    reason: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const peopleById = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  )

  const rows = useMemo(
    () => [...excellence].sort((a, b) => b.date.localeCompare(a.date)),
    [excellence],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of excellence) {
      map.set(e.personId, (map.get(e.personId) ?? 0) + 1)
    }
    return map
  }, [excellence])

  async function save() {
    if (!form.personId || !form.reason.trim()) {
      alert('الفرد وسبب التميز مطلوبان')
      return
    }

    try {
      await createExcellence(form).unwrap()
      setOpen(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر حفظ واقعة التميز')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف واقعة التميز؟')) return
    try {
      await deleteExcellence(id).unwrap()
    } catch {
      alert('تعذر حذف الواقعة')
    }
  }

  async function handleSeed() {
    try {
      const result = await seedExcellence().unwrap()
      alert(result.message)
    } catch {
      alert('تعذر إدخال البيانات التجريبية')
    }
  }

  return (
    <div>
      <PageHeader
        title="العسكري المتميز"
        description="كل واقعة تميز تُسجَّل مستقلة — لا تعديل على الوقائع السابقة"
        actions={
          <>
            {canWrite && excellence.length === 0 && !isLoading && (
              <Button
                variant="secondary"
                onClick={handleSeed}
                disabled={isSeeding || people.length === 0}
              >
                {isSeeding ? 'جاري الإدخال...' : 'بيانات تجريبية'}
              </Button>
            )}
            {canWrite && (
              <Button
                onClick={() => {
                  setForm({
                    personId: people[0]?.id ?? '',
                    status: 'تميز أداء',
                    reason: '',
                    date: new Date().toISOString().slice(0, 10),
                    notes: '',
                  })
                  setOpen(true)
                }}
                disabled={people.length === 0}
              >
                تسجيل واقعة تميز
              </Button>
            )}
          </>
        }
      />

      {isLoading && <EmptyState message="جاري تحميل وقائع التميز..." />}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-3">تعذر تحميل التميز من الخادم</p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState message="لا توجد وقائع تميز — سجّل واقعة أو استخدم البيانات التجريبية" />
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table
          headers={[
            'التاريخ',
            'العسكري',
            'حالة التميز',
            'السبب',
            'مرات التميز',
            'ملاحظات',
            'إجراء',
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
                  {peopleById.get(e.personId)?.name ?? '—'}
                </Link>
              </Td>
              <Td>{e.status}</Td>
              <Td>{e.reason}</Td>
              <Td>{counts.get(e.personId) ?? 1}</Td>
              <Td>{e.notes || '—'}</Td>
              <Td>
                {canWrite && (
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(e.id)}
                    disabled={isDeleting}
                  >
                    حذف
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={open}
        title="واقعة تميز جديدة"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={isCreating}>
              {isCreating ? 'جاري الحفظ...' : 'حفظ الواقعة'}
            </Button>
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
              {people.map((p) => (
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
