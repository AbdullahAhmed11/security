export type PresenceStatus = 'present' | 'on_leave'

export interface Person {
  id: string
  number: string
  name: string
  rank: string
  specialty: string
  unit: string
  birthDate: string
  enlistmentDate: string
  dischargeDate: string
  notes: string
  presence: PresenceStatus
}

export type LeaveReturnStatus = 'pending' | 'on_time' | 'late' | 'extended' | 'deducted'

export interface LeaveRecord {
  id: string
  personId: string
  batch: string
  departureDate: string
  durationDays: number
  expectedReturnDate: string
  actualReturnDate: string
  returnStatus: LeaveReturnStatus
  notes: string
}

export interface DutyRecord {
  id: string
  personId: string
  date: string
  dutyType: string
  location: string
  period: string
  notes: string
}

export interface ExcellenceRecord {
  id: string
  personId: string
  status: string
  reason: string
  date: string
  notes: string
}

export type DocumentType =
  | 'محضر'
  | 'مذكرة'
  | 'جواب'
  | 'فاكس'
  | 'تعليمات'
  | 'قرار'
  | 'أخرى'

export interface ArchiveDocument {
  id: string
  serialNumber: string
  date: string
  type: DocumentType
  fromEntity: string
  toEntity: string
  subject: string
  personId: string | null
  notes: string
}

export interface AppData {
  people: Person[]
  leaves: LeaveRecord[]
  duties: DutyRecord[]
  excellence: ExcellenceRecord[]
  documents: ArchiveDocument[]
  settings: {
    systemName: string
    ranks: string[]
    units: string[]
    specialties: string[]
    dutyTypes: string[]
    documentTypes: DocumentType[]
  }
}
