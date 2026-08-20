import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LeaveReturnStatus } from '../types'
import { useAuth } from '../context/AuthContext'
import {
  useCreateLeaveMutation,
  useDeleteLeaveMutation,
  useGetLeavesQuery,
  useReturnLeaveMutation,
  useSeedLeavesMutation,
} from '../store/leavesApi'
import { useGetPersonnelQuery } from '../store/personnelApi'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Badge, EmptyState, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const statusLabel: Record<LeaveReturnStatus, string> = {
  pending: 'بانتظار العودة',
  on_time: 'في الموعد',
  late: 'متأخر',
  extended: 'ممدد',
  deducted: 'خصم',
}

export default function LeavesPage() {
  const { canWrite } = useAuth()
  const { data: people = [] } = useGetPersonnelQuery()
  const { data: leaves = [], isLoading, isError, refetch } = useGetLeavesQuery()
  const [createLeave, { isLoading: isCreating }] = useCreateLeaveMutation()
  const [returnLeave, { isLoading: isReturning }] = useReturnLeaveMutation()
  const [deleteLeave, { isLoading: isDeleting }] = useDeleteLeaveMutation()
  const [seedLeaves, { isLoading: isSeeding }] = useSeedLeavesMutation()

  const [openDepart, setOpenDepart] = useState(false)
  const [openReturn, setOpenReturn] = useState(false)
  const [returnLeaveId, setReturnLeaveId] = useState<string | null>(null)

  const [departForm, setDepartForm] = useState({
    personId: '',
    batch: 'دفعة أ',
    departureDate: new Date().toISOString().slice(0, 10),
    durationDays: 7,
    notes: '',
  })

  const [returnForm, setReturnForm] = useState({
    actualReturnDate: new Date().toISOString().slice(0, 10),
    returnStatus: 'on_time' as LeaveReturnStatus,
    notes: '',
  })

  const peopleById = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  )

  const rows = useMemo(
    () =>
      [...leaves].sort((a, b) =>
        b.departureDate.localeCompare(a.departureDate),
      ),
    [leaves],
  )

  async function saveDepart() {
    if (!departForm.personId) {
      alert('اختر الفرد')
      return
    }
    const expectedReturnDate = addDays(
      departForm.departureDate,
      departForm.durationDays,
    )
    try {
      await createLeave({
        personId: departForm.personId,
        batch: departForm.batch,
        departureDate: departForm.departureDate,
        durationDays: departForm.durationDays,
        expectedReturnDate,
        actualReturnDate: '',
        returnStatus: 'pending',
        notes: departForm.notes,
      }).unwrap()
      setOpenDepart(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر تسجيل الإجازة')
    }
  }

  function openReturnModal(leaveId: string) {
    const leave = leaves.find((l) => l.id === leaveId)
    setReturnLeaveId(leaveId)
    setReturnForm({
      actualReturnDate: new Date().toISOString().slice(0, 10),
      returnStatus: 'on_time',
      notes: leave?.notes ?? '',
    })
    setOpenReturn(true)
  }

  async function saveReturn() {
    if (!returnLeaveId) return
    try {
      await returnLeave({ id: returnLeaveId, ...returnForm }).unwrap()
      setOpenReturn(false)
    } catch {
      alert('تعذر تسجيل العودة')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف سجل الإجازة؟')) return
    try {
      await deleteLeave(id).unwrap()
    } catch {
      alert('تعذر حذف الإجازة')
    }
  }

  async function handleSeed() {
    try {
      const result = await seedLeaves().unwrap()
      alert(result.message)
    } catch {
      alert('تعذر إدخال البيانات التجريبية')
    }
  }

  return (
    <div>
      <PageHeader
        title="الإجازات والدفعات"
        description="21 يوم خدمة ← 7 أو 8 أيام إجازة — كل حركة تُحفظ في سجل مستقل"
        actions={
          <>
            {canWrite && leaves.length === 0 && !isLoading && (
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
                  setDepartForm({
                    personId: people[0]?.id ?? '',
                    batch: 'دفعة أ',
                    departureDate: new Date().toISOString().slice(0, 10),
                    durationDays: 7,
                    notes: '',
                  })
                  setOpenDepart(true)
                }}
                disabled={people.length === 0}
              >
                تسجيل نزول إجازة
              </Button>
            )}
          </>
        }
      />

      {isLoading && <EmptyState message="جاري تحميل الإجازات..." />}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-3">تعذر تحميل الإجازات من الخادم</p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState message="لا توجد إجازات — سجّل نزول إجازة أو استخدم البيانات التجريبية" />
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Table
          headers={[
            'الفرد',
            'الدفعة',
            'النزول',
            'المدة',
            'العودة المتوقعة',
            'العودة الفعلية',
            'الحالة',
            'ملاحظات',
            'إجراء',
          ]}
        >
          {rows.map((l) => {
            const person = peopleById.get(l.personId)
            return (
              <tr key={l.id}>
                <Td>
                  {person ? (
                    <Link
                      to={`/personnel/${person.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {person.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </Td>
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
                    {statusLabel[l.returnStatus]}
                  </Badge>
                </Td>
                <Td className="max-w-40 truncate">{l.notes || '—'}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {l.returnStatus === 'pending' ? (
                      canWrite ? (
                        <Button
                          variant="secondary"
                          onClick={() => openReturnModal(l.id)}
                        >
                          تسجيل عودة
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">
                          بانتظار العودة
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">
                        محفوظة
                      </span>
                    )}
                    {canWrite && (
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(l.id)}
                        disabled={isDeleting}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            )
          })}
        </Table>
      )}

      <Modal
        open={openDepart}
        title="تسجيل نزول إجازة"
        onClose={() => setOpenDepart(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenDepart(false)}>
              إلغاء
            </Button>
            <Button onClick={saveDepart} disabled={isCreating}>
              {isCreating ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الفرد">
            <Select
              value={departForm.personId}
              onChange={(e) =>
                setDepartForm({ ...departForm, personId: e.target.value })
              }
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.number})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="الدفعة">
            <Input
              value={departForm.batch}
              onChange={(e) =>
                setDepartForm({ ...departForm, batch: e.target.value })
              }
            />
          </Field>
          <Field label="تاريخ النزول">
            <Input
              type="date"
              value={departForm.departureDate}
              onChange={(e) =>
                setDepartForm({ ...departForm, departureDate: e.target.value })
              }
            />
          </Field>
          <Field label="مدة الإجازة (أيام)">
            <Select
              value={departForm.durationDays}
              onChange={(e) =>
                setDepartForm({
                  ...departForm,
                  durationDays: Number(e.target.value),
                })
              }
            >
              <option value={7}>7 أيام</option>
              <option value={8}>8 أيام</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="ملاحظات (تمديد / خصم / سبب)">
              <Textarea
                value={departForm.notes}
                onChange={(e) =>
                  setDepartForm({ ...departForm, notes: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={openReturn}
        title="تسجيل عودة من الإجازة"
        onClose={() => setOpenReturn(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenReturn(false)}>
              إلغاء
            </Button>
            <Button onClick={saveReturn} disabled={isReturning}>
              {isReturning ? 'جاري الحفظ...' : 'حفظ العودة'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="تاريخ العودة الفعلي">
            <Input
              type="date"
              value={returnForm.actualReturnDate}
              onChange={(e) =>
                setReturnForm({
                  ...returnForm,
                  actualReturnDate: e.target.value,
                })
              }
            />
          </Field>
          <Field label="حالة العودة">
            <Select
              value={returnForm.returnStatus}
              onChange={(e) =>
                setReturnForm({
                  ...returnForm,
                  returnStatus: e.target.value as LeaveReturnStatus,
                })
              }
            >
              <option value="on_time">في الموعد</option>
              <option value="late">متأخر</option>
              <option value="extended">ممدد</option>
              <option value="deducted">خصم من الإجازة</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="ملاحظات">
              <Textarea
                value={returnForm.notes}
                onChange={(e) =>
                  setReturnForm({ ...returnForm, notes: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}
