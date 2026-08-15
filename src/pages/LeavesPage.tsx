import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import type { LeaveReturnStatus } from '../types'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { Badge, PageHeader } from '../components/ui/Misc'
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
  const { data, getPerson, addLeave, returnFromLeave } = useData()
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

  const rows = useMemo(
    () =>
      [...data.leaves].sort((a, b) =>
        b.departureDate.localeCompare(a.departureDate),
      ),
    [data.leaves],
  )

  function saveDepart() {
    if (!departForm.personId) {
      alert('اختر الفرد')
      return
    }
    const expectedReturnDate = addDays(
      departForm.departureDate,
      departForm.durationDays,
    )
    addLeave({
      personId: departForm.personId,
      batch: departForm.batch,
      departureDate: departForm.departureDate,
      durationDays: departForm.durationDays,
      expectedReturnDate,
      actualReturnDate: '',
      returnStatus: 'pending',
      notes: departForm.notes,
    })
    setOpenDepart(false)
  }

  function openReturnModal(leaveId: string) {
    const leave = data.leaves.find((l) => l.id === leaveId)
    setReturnLeaveId(leaveId)
    setReturnForm({
      actualReturnDate: new Date().toISOString().slice(0, 10),
      returnStatus: 'on_time',
      notes: leave?.notes ?? '',
    })
    setOpenReturn(true)
  }

  function saveReturn() {
    if (!returnLeaveId) return
    returnFromLeave(returnLeaveId, returnForm)
    setOpenReturn(false)
  }

  return (
    <div>
      <PageHeader
        title="الإجازات والدفعات"
        description="21 يوم خدمة ← 7 أو 8 أيام إجازة — كل حركة تُحفظ في سجل مستقل"
        actions={
          <Button
            onClick={() => {
              setDepartForm({
                personId: data.people[0]?.id ?? '',
                batch: 'دفعة أ',
                departureDate: new Date().toISOString().slice(0, 10),
                durationDays: 7,
                notes: '',
              })
              setOpenDepart(true)
            }}
          >
            تسجيل نزول إجازة
          </Button>
        }
      />

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
          const person = getPerson(l.personId)
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
                {l.returnStatus === 'pending' ? (
                  <Button variant="secondary" onClick={() => openReturnModal(l.id)}>
                    تسجيل عودة
                  </Button>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">محفوظة</span>
                )}
              </Td>
            </tr>
          )
        })}
      </Table>

      <Modal
        open={openDepart}
        title="تسجيل نزول إجازة"
        onClose={() => setOpenDepart(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenDepart(false)}>
              إلغاء
            </Button>
            <Button onClick={saveDepart}>حفظ</Button>
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
              {data.people.map((p) => (
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
            <Button onClick={saveReturn}>حفظ العودة</Button>
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
