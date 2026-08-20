import { useState } from 'react'
import { PrintReport } from '../components/PrintReport'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Card, EmptyState, PageHeader } from '../components/ui/Misc'
import { Table, Td } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { useGetPersonnelQuery } from '../store/personnelApi'
import { useAuth } from '../context/AuthContext'
import { resolveApiUrl } from '../lib/apiUrl'
import {
  useDeleteReportFileMutation,
  useGetReportFilesQuery,
  useGetReportQuery,
  useUploadReportFileMutation,
  type ReportKey,
} from '../store/reportsApi'

const reportTitles: Record<ReportKey, string> = {
  people: 'تقرير الأفراد',
  leaves: 'تقرير الإجازات',
  duties: 'تقرير الخدمات',
  excellence: 'تقرير العسكري المتميز',
  archive: 'تقرير الأرشيف',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ReportsPage() {
  const { canWrite } = useAuth()
  const { data: people = [] } = useGetPersonnelQuery()
  const [report, setReport] = useState<ReportKey>('people')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [personId, setPersonId] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const { data, isLoading, isError, isFetching, refetch } = useGetReportQuery({
    type: report,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    personId: personId || undefined,
  })

  const {
    data: files = [],
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useGetReportFilesQuery({ reportType: report })

  const [uploadFile, { isLoading: isUploading }] = useUploadReportFileMutation()
  const [deleteFile, { isLoading: isDeleting }] = useDeleteReportFileMutation()

  const rows = data?.rows ?? []
  const title = data?.title ?? reportTitles[report]

  async function handleUpload() {
    if (!selectedFile) {
      alert('اختر ملفاً أولاً')
      return
    }

    try {
      await uploadFile({
        file: selectedFile,
        reportType: report,
        notes,
      }).unwrap()
      setSelectedFile(null)
      setNotes('')
      setFileInputKey((k) => k + 1)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? '')
          : ''
      alert(message || 'تعذر رفع الملف')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الملف؟')) return
    try {
      await deleteFile(id).unwrap()
    } catch {
      alert('تعذر حذف الملف')
    }
  }

  return (
    <div>
      <PageHeader
        title="التقارير والطباعة"
        description="تقارير جاهزة للمعاينة والطباعة — مع رفع مستندات وصور مرفقة"
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              refetch()
              refetchFiles()
            }}
            className="no-print"
          >
            تحديث
          </Button>
        }
      />

      <Card className="mb-6 no-print">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="نوع التقرير">
            <Select
              value={report}
              onChange={(e) => setReport(e.target.value as ReportKey)}
            >
              {(Object.keys(reportTitles) as ReportKey[]).map((k) => (
                <option key={k} value={k}>
                  {reportTitles[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="من تاريخ">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Field>
          <Field label="إلى تاريخ">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Field>
          <Field label="فرد (اختياري)">
            <Select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">الكل</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="mb-6 no-print">
        <h2 className="mb-3 font-semibold">مرفقات التقرير (مستندات وصور)</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          الصور: JPG / PNG / GIF / WEBP — المستندات: PDF / Word / Excel / TXT —
          الحد الأقصى 10 ميجابايت
        </p>
        {canWrite ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="وصف المرفق..."
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
              </Button>
              {selectedFile ? (
                <span className="text-sm text-[var(--text-muted)]">
                  {selectedFile.name} ({formatSize(selectedFile.size)})
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            حساب مشاهدة — يمكنك فتح المرفقات دون رفع أو حذف
          </p>
        )}

        <div className="mt-6">
          {filesLoading ? (
            <EmptyState message="جاري تحميل المرفقات..." />
          ) : files.length === 0 ? (
            <EmptyState message="لا توجد مرفقات لهذا التقرير بعد" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-[var(--border)] bg-white p-3"
                >
                  {f.kind === 'image' ? (
                    <a href={resolveApiUrl(f.url)} target="_blank" rel="noreferrer">
                      <img
                        src={resolveApiUrl(f.url)}
                        alt={f.originalName}
                        className="mb-2 h-36 w-full rounded object-cover"
                      />
                    </a>
                  ) : (
                    <div className="mb-2 flex h-36 items-center justify-center rounded bg-[var(--surface-2)] text-sm text-[var(--text-muted)]">
                      مستند
                    </div>
                  )}
                  <p className="truncate text-sm font-medium">{f.originalName}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatSize(f.size)} —{' '}
                    {new Date(f.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                  {f.notes ? (
                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                      {f.notes}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <a href={resolveApiUrl(f.url)} target="_blank" rel="noreferrer">
                      <Button variant="secondary">فتح</Button>
                    </a>
                    {canWrite && (
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(f.id)}
                        disabled={isDeleting}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {(isLoading || isFetching) && (
        <EmptyState message="جاري تحميل التقرير..." />
      )}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 no-print">
          <p className="mb-3">تعذر تحميل التقرير من الخادم</p>
          <Button variant="secondary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <PrintReport title={title}>
          {rows.length === 0 ? (
            <EmptyState message="لا توجد بيانات لهذا التقرير" />
          ) : (
            <>
              {report === 'people' && (
                <Table
                  headers={[
                    'رقم الفرد',
                    'الاسم',
                    'الرتبة',
                    'التخصص',
                    'الوحدة',
                    'الحالة',
                  ]}
                >
                  {rows.map((p) => (
                    <tr key={String(p.id)}>
                      <Td>{String(p.number ?? '')}</Td>
                      <Td>{String(p.name ?? '')}</Td>
                      <Td>{String(p.rank ?? '')}</Td>
                      <Td>{String(p.specialty ?? '')}</Td>
                      <Td>{String(p.unit ?? '')}</Td>
                      <Td>{String(p.presenceLabel ?? '')}</Td>
                    </tr>
                  ))}
                </Table>
              )}

              {report === 'leaves' && (
                <Table
                  headers={[
                    'الاسم',
                    'الدفعة',
                    'تاريخ النزول',
                    'تاريخ العودة المتوقع',
                    'تاريخ العودة الفعلي',
                    'الحالة',
                  ]}
                >
                  {rows.map((l) => (
                    <tr key={String(l.id)}>
                      <Td>{String(l.personName ?? '')}</Td>
                      <Td>{String(l.batch ?? '')}</Td>
                      <Td>{String(l.departureDate ?? '')}</Td>
                      <Td>{String(l.expectedReturnDate ?? '')}</Td>
                      <Td>{String(l.actualReturnDate || '—')}</Td>
                      <Td>{String(l.returnStatus ?? '')}</Td>
                    </tr>
                  ))}
                </Table>
              )}

              {report === 'duties' && (
                <Table
                  headers={[
                    'التاريخ',
                    'الفرد',
                    'نوع الخدمة',
                    'المكان',
                    'الفترة',
                  ]}
                >
                  {rows.map((d) => (
                    <tr key={String(d.id)}>
                      <Td>{String(d.date ?? '')}</Td>
                      <Td>{String(d.personName ?? '')}</Td>
                      <Td>{String(d.dutyType ?? '')}</Td>
                      <Td>{String(d.location ?? '')}</Td>
                      <Td>{String(d.period ?? '')}</Td>
                    </tr>
                  ))}
                </Table>
              )}

              {report === 'excellence' && (
                <Table
                  headers={[
                    'الاسم',
                    'سبب التميز',
                    'تاريخ التميز',
                    'حالة التميز',
                    'عدد مرات التميز',
                  ]}
                >
                  {rows.map((e) => (
                    <tr key={String(e.id)}>
                      <Td>{String(e.personName ?? '')}</Td>
                      <Td>{String(e.reason ?? '')}</Td>
                      <Td>{String(e.date ?? '')}</Td>
                      <Td>{String(e.status ?? '')}</Td>
                      <Td>{String(e.count ?? 1)}</Td>
                    </tr>
                  ))}
                </Table>
              )}

              {report === 'archive' && (
                <Table
                  headers={[
                    'الرقم',
                    'التاريخ',
                    'النوع',
                    'الموضوع',
                    'من',
                    'إلى',
                  ]}
                >
                  {rows.map((d) => (
                    <tr key={String(d.id)}>
                      <Td>{String(d.serialNumber ?? '')}</Td>
                      <Td>{String(d.date ?? '')}</Td>
                      <Td>{String(d.type ?? '')}</Td>
                      <Td>{String(d.subject ?? '')}</Td>
                      <Td>{String(d.fromEntity ?? '')}</Td>
                      <Td>{String(d.toEntity ?? '')}</Td>
                    </tr>
                  ))}
                </Table>
              )}
            </>
          )}
        </PrintReport>
      )}
    </div>
  )
}
