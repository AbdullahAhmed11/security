import type { Person } from '../types'
import { seedData } from '../data/seed'

const STORAGE_KEY = 'security-personnel-v1'

function uid() {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function loadPersonnel(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Person[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Fall through to seed data.
  }

  const seeded = structuredClone(seedData.people)
  savePersonnel(seeded)
  return seeded
}

export function savePersonnel(people: Person[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people))
}

export function createPersonnelRecord(input: Omit<Person, 'id'>): Person {
  const people = loadPersonnel()
  const created: Person = { ...input, id: uid() }
  savePersonnel([...people, created])
  return created
}

export function updatePersonnelRecord(
  id: string,
  patch: Partial<Omit<Person, 'id'>>,
): Person {
  const people = loadPersonnel()
  const index = people.findIndex((person) => person.id === id)
  if (index < 0) {
    throw new Error('الفرد غير موجود')
  }
  const updated: Person = { ...people[index], ...patch, id }
  const next = [...people]
  next[index] = updated
  savePersonnel(next)
  return updated
}

export function deletePersonnelRecord(id: string) {
  const people = loadPersonnel()
  const next = people.filter((person) => person.id !== id)
  if (next.length === people.length) {
    throw new Error('الفرد غير موجود')
  }
  savePersonnel(next)
  return { id }
}

export function getPersonnelById(id: string) {
  return loadPersonnel().find((person) => person.id === id)
}
