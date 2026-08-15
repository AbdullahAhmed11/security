import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedData } from '../data/seed'
import type {
  AppData,
  ArchiveDocument,
  DutyRecord,
  ExcellenceRecord,
  LeaveRecord,
  Person,
} from '../types'

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function nextSerial(documents: ArchiveDocument[]) {
  const year = new Date().getFullYear()
  const nums = documents
    .map((d) => {
      const m = d.serialNumber.match(/ARC-(\d{4})-(\d+)/)
      return m && Number(m[1]) === year ? Number(m[2]) : 0
    })
    .filter(Boolean)
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `ARC-${year}-${String(next).padStart(4, '0')}`
}

interface DataContextValue {
  data: AppData
  getPerson: (id: string) => Person | undefined
  addPerson: (person: Omit<Person, 'id'>) => Person
  updatePerson: (id: string, patch: Partial<Omit<Person, 'id'>>) => void
  addLeave: (leave: Omit<LeaveRecord, 'id'>) => LeaveRecord
  returnFromLeave: (
    leaveId: string,
    payload: Pick<LeaveRecord, 'actualReturnDate' | 'returnStatus' | 'notes'>,
  ) => void
  addDuty: (duty: Omit<DutyRecord, 'id'>) => DutyRecord
  addExcellence: (record: Omit<ExcellenceRecord, 'id'>) => ExcellenceRecord
  addDocument: (
    doc: Omit<ArchiveDocument, 'id' | 'serialNumber'>,
  ) => ArchiveDocument
  stats: {
    totalPeople: number
    present: number
    onLeave: number
    returnedRecently: number
    excellenceCount: number
    distinctExcellencePeople: number
    dutiesCount: number
    documentsCount: number
  }
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(seedData)

  const getPerson = useCallback(
    (id: string) => data.people.find((p) => p.id === id),
    [data.people],
  )

  const addPerson = useCallback((person: Omit<Person, 'id'>) => {
    const created: Person = { ...person, id: uid('p') }
    setData((prev) => ({ ...prev, people: [...prev.people, created] }))
    return created
  }, [])

  const updatePerson = useCallback(
    (id: string, patch: Partial<Omit<Person, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        people: prev.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }))
    },
    [],
  )

  const addLeave = useCallback((leave: Omit<LeaveRecord, 'id'>) => {
    const created: LeaveRecord = { ...leave, id: uid('l') }
    setData((prev) => ({
      ...prev,
      leaves: [...prev.leaves, created],
      people: prev.people.map((p) =>
        p.id === leave.personId ? { ...p, presence: 'on_leave' as const } : p,
      ),
    }))
    return created
  }, [])

  const returnFromLeave = useCallback(
    (
      leaveId: string,
      payload: Pick<LeaveRecord, 'actualReturnDate' | 'returnStatus' | 'notes'>,
    ) => {
      setData((prev) => {
        const leave = prev.leaves.find((l) => l.id === leaveId)
        if (!leave) return prev
        return {
          ...prev,
          leaves: prev.leaves.map((l) =>
            l.id === leaveId ? { ...l, ...payload } : l,
          ),
          people: prev.people.map((p) =>
            p.id === leave.personId ? { ...p, presence: 'present' as const } : p,
          ),
        }
      })
    },
    [],
  )

  const addDuty = useCallback((duty: Omit<DutyRecord, 'id'>) => {
    const created: DutyRecord = { ...duty, id: uid('d') }
    setData((prev) => ({ ...prev, duties: [...prev.duties, created] }))
    return created
  }, [])

  const addExcellence = useCallback((record: Omit<ExcellenceRecord, 'id'>) => {
    const created: ExcellenceRecord = { ...record, id: uid('e') }
    setData((prev) => ({
      ...prev,
      excellence: [...prev.excellence, created],
    }))
    return created
  }, [])

  const addDocument = useCallback(
    (doc: Omit<ArchiveDocument, 'id' | 'serialNumber'>) => {
      let created!: ArchiveDocument
      setData((prev) => {
        created = {
          ...doc,
          id: uid('doc'),
          serialNumber: nextSerial(prev.documents),
        }
        return { ...prev, documents: [...prev.documents, created] }
      })
      return created
    },
    [],
  )

  const stats = useMemo(() => {
    const present = data.people.filter((p) => p.presence === 'present').length
    const onLeave = data.people.filter((p) => p.presence === 'on_leave').length
    const returnedRecently = data.leaves.filter(
      (l) => l.returnStatus !== 'pending' && l.actualReturnDate,
    ).length
    return {
      totalPeople: data.people.length,
      present,
      onLeave,
      returnedRecently,
      excellenceCount: data.excellence.length,
      distinctExcellencePeople: new Set(data.excellence.map((e) => e.personId))
        .size,
      dutiesCount: data.duties.length,
      documentsCount: data.documents.length,
    }
  }, [data])

  const value = useMemo(
    () => ({
      data,
      getPerson,
      addPerson,
      updatePerson,
      addLeave,
      returnFromLeave,
      addDuty,
      addExcellence,
      addDocument,
      stats,
    }),
    [
      data,
      getPerson,
      addPerson,
      updatePerson,
      addLeave,
      returnFromLeave,
      addDuty,
      addExcellence,
      addDocument,
      stats,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
