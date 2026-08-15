import type { ReactNode } from 'react'
import { Button } from './ui/Button'

export function PrintReport({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="print-area">
      <div className="mb-4 flex items-center justify-between gap-3 no-print">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button onClick={() => window.print()}>طباعة التقرير</Button>
      </div>
      <div className="print-only mb-4 hidden print:block">
        <h1 className="text-xl font-bold">منظومة إدارة قسم الأمن</h1>
        <p className="text-sm">{title}</p>
        <p className="text-xs text-stone-500">
          تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}
        </p>
      </div>
      {children}
    </div>
  )
}
