import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import type { ArchiveDocument, DocumentType } from '../types'
import { useAuth } from '../context/AuthContext'
import { resolveApiUrl } from '../lib/apiUrl'
import {
  useCreateArchiveMutation,
  useDeleteArchiveAttachmentMutation,
  useDeleteArchiveMutation,
  useGetArchiveAttachmentsQuery,
  useGetArchiveQuery,
  useSeedArchiveMutation,
  useUpdateArchiveMutation,
  useUploadArchiveAttachmentMutation,
} from '../store/archiveApi'
import { useGetPersonnelQuery } from '../store/personnelApi'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  type: 'مذكرة' as DocumentType,
  fromEntity: '',
  toEntity: '',
  subject: '',
  personId: '' as string,
  notes: '',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ArchivePage() {
  const { canWrite } = useAuth()
  const { data: appData } = useData()
  const { data: people = [] } = useGetPersonnelQuery()
  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useGetArchiveQuery()
  const [createArchive, { isLoading: isCreating }] = useCreateArchiveMutation()
  const [updateArchive, { isLoading: isUpdating }] = useUpdateArchiveMutation()
  const [deleteArchive, { isLoading: isDeleting }] = useDeleteArchiveMutation()
  const [seedArchive, { isLoading: isSeeding }] = useSeedArchiveMutation()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(emptyForm)

  const [attachDoc, setAttachDoc] = useState<ArchiveDocument | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [attachNotes, setAttachNotes] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)

  const {
    data: attachments = [],
    isLoading: attachmentsLoading,
  } = useGetArchiveAttachmentsQuery(
    { documentId: attachDoc?.id },
    { skip: !attachDoc },
  )
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadArchiveAttachmentMutation()
  const [deleteAttachment, { isLoading: isDeletingAttachment }] =
    useDeleteArchiveAttachmentMutation()

  const { data: allAttachments = [] } = useGetArchiveAttachmentsQuery()

  const attachmentCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of allAttachments) {
      map.set(a.documentId, (map.get(a.documentId) ?? 0) + 1)
    }
    return map
  }, [allAttachments])

  const peopleById = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  )

  const rows = useMemo(() => {
    const q = query.trim()
    return [...documents]
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
  }, [documents, filterType, query])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
      type: 'مذكرة',
    })
    setOpen(true)
  }

  function openEdit(doc: ArchiveDocument) {
    setEditingId(doc.id)
    setForm({
      date: doc.date,
      type: doc.type,
      fromEntity: doc.fromEntity,
      toEntity: doc.toEntity,
      subject: doc.subject,
      personId: doc.personId ?? '',
      notes: doc.notes,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.subject.trim()) {
      alert('موضوع المستند مطلوب')
      return
    }

    const payload = {
      date: form.date,
      type: form.type,
      fromEntity: form.fromEntity,
      toEntity: form.toEntity,
      subject: form.subject,
      personId: form.personId || null,
      notes: form.notes,
    }

    try {
      if (editingId) {
        await updateArchive({ id: editingId, ...payload }).unwrap()
      } else {
        await createArchive(payload).unwrap()
      }
      setOpen(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر حفظ المستند')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف المستند ومرفقاته؟')) return
    try {
      await deleteArchive(id).unwrap()
    } catch {
      alert('تعذر حذف المستند')
    }
  }

  async function handleSeed() {
    try {
      const result = await seedArchive().unwrap()
      alert(result.message)
    } catch {
      alert('تعذر إدخال البيانات التجريبية')
    }
  }

  async function handleUploadAttachment() {
    if (!attachDoc || !selectedFile) {
      alert('اختر ملفاً أولاً')
      return
    }

    try {
      await uploadAttachment({
        file: selectedFile,
        documentId: attachDoc.id,
        notes: attachNotes,
      }).unwrap()
      setSelectedFile(null)
      setAttachNotes('')
      setFileInputKey((k) => k + 1)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر رفع المرفق')
    }
  }

  async function handleDeleteAttachment(id: string) {
    if (!confirm('حذف هذا المرفق؟')) return
    try {
      await deleteAttachment(id).unwrap()
    } catch {
      alert('تعذر حذف المرفق')
    }
  }

  const saving = isCreating || isUpdating

  return (
    <div>
      <PageHeader
        title="الأرشيف الإلكتروني"
        description="استلام → تسجيل → تصنيف → رقم تسلسلي تلقائي → مرفقات وصور"
        actions={
          <>
            {canWrite && documents.length === 0 && !isLoading && (
              <Button
                variant="secondary"
                onClick={handleSeed}
                disabled={isSeeding}
              >
                {isSeeding ? 'جاري الإدخال...' : 'بيانات تجريبية'}
              </Button>
            )}
            {canWrite && <Button onClick={openCreate}>تسجيل مستند</Button>}
          </>
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
            {appData.settings.documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {isLoading && <EmptyState message="جاري تحميل الأرشيف..." />}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-3">تعذر تحميل الأرشيف من الخادم</p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState message="لا توجد مستندات — سجّل مستنداً أو استخدم البيانات التجريبية" />
      )}

      {!isLoading && !isError && rows.length > 0 && (
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
            'مرفقات',
            'إجراء',
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
                    {peopleById.get(d.personId)?.name ?? '—'}
                  </Link>
                ) : (
                  '—'
                )}
              </Td>
              <Td>{d.notes || '—'}</Td>
              <Td>{attachmentCounts.get(d.id) ?? 0}</Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setAttachDoc(d)}>
                    مرفقات
                  </Button>
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
        title={editingId ? 'تعديل مستند' : 'تسجيل مستند جديد'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving
                ? 'جاري الحفظ...'
                : editingId
                  ? 'حفظ التعديلات'
                  : 'حفظ وإعطاء رقم تسلسلي'}
            </Button>
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
              {appData.settings.documentTypes.map((t) => (
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
              {people.map((p) => (
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

      <Modal
        open={!!attachDoc}
        title={
          attachDoc
            ? `مرفقات المستند ${attachDoc.serialNumber}`
            : 'مرفقات المستند'
        }
        onClose={() => {
          setAttachDoc(null)
          setSelectedFile(null)
          setAttachNotes('')
          setFileInputKey((k) => k + 1)
        }}
        footer={
          <Button
            variant="secondary"
            onClick={() => {
              setAttachDoc(null)
              setSelectedFile(null)
              setAttachNotes('')
            }}
          >
            إغلاق
          </Button>
        }
      >
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          صور: JPG / PNG / GIF / WEBP — مستندات: PDF / Word / Excel / TXT — حد
          10 ميجابايت
        </p>
        {canWrite ? (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Field label="اختر ملفاً">
                <Input
                  key={fileInputKey}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </Field>
              <Field label="ملاحظات (اختياري)">
                <Textarea
                  value={attachNotes}
                  onChange={(e) => setAttachNotes(e.target.value)}
                />
              </Field>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleUploadAttachment}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? 'جاري الرفع...' : 'رفع مرفق'}
              </Button>
              {selectedFile ? (
                <span className="text-sm text-[var(--text-muted)]">
                  {selectedFile.name} ({formatSize(selectedFile.size)})
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            حساب مشاهدة — يمكنك فتح المرفقات دون رفع أو حذف
          </p>
        )}

        {attachmentsLoading ? (
          <EmptyState message="جاري تحميل المرفقات..." />
        ) : attachments.length === 0 ? (
          <EmptyState message="لا توجد مرفقات لهذا المستند" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {attachments.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-[var(--border)] bg-white p-3"
              >
                {f.kind === 'image' ? (
                  <a href={resolveApiUrl(f.url)} target="_blank" rel="noreferrer">
                    <img
                      src={resolveApiUrl(f.url)}
                      alt={f.originalName}
                      className="mb-2 h-28 w-full rounded object-cover"
                    />
                  </a>
                ) : (
                  <div className="mb-2 flex h-28 items-center justify-center rounded bg-[var(--surface-2)] text-sm text-[var(--text-muted)]">
                    مستند
                  </div>
                )}
                <p className="truncate text-sm font-medium">{f.originalName}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatSize(f.size)}
                </p>
                <div className="mt-2 flex gap-2">
                  <a href={resolveApiUrl(f.url)} target="_blank" rel="noreferrer">
                    <Button variant="secondary">فتح</Button>
                  </a>
                  {canWrite && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAttachment(f.id)}
                      disabled={isDeletingAttachment}
                    >
                      حذف
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
