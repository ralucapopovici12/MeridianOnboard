import { useCallback, useEffect, useState } from 'react'

// Mandatory onboarding training. Videos open a player; readings link to a doc.
// Completion is tracked per employee in localStorage (no backend yet).

export interface TrainingItem {
  id: string
  title: string
  description: string
  type: 'video' | 'reading'
  minutes: number
  docId?: string // supporting/required document (slug in lib/docs)
  mandatory: boolean
}

export const TRAINING: TrainingItem[] = [
  {
    id: 'workplace-safety',
    title: 'Workplace Health & Safety',
    description: 'Fire safety, evacuation, first aid, and a healthy home-office setup.',
    type: 'video',
    minutes: 8,
    docId: 'workplace-safety',
    mandatory: true,
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Essentials',
    description: 'Spotting phishing, MFA, safe devices, and reporting incidents.',
    type: 'video',
    minutes: 10,
    docId: 'it-security',
    mandatory: true,
  },
  {
    id: 'data-privacy',
    title: 'Data Privacy & GDPR Basics',
    description: 'Handling personal data responsibly and what to do about breaches.',
    type: 'video',
    minutes: 7,
    docId: 'data-privacy',
    mandatory: true,
  },
  {
    id: 'escalation',
    title: 'Raising Concerns & Escalation Paths',
    description: 'How to escalate technical, people, and ethical issues — and who to contact.',
    type: 'reading',
    minutes: 5,
    docId: 'escalation',
    mandatory: true,
  },
  {
    id: 'code-of-conduct',
    title: 'Code of Conduct',
    description: 'The standards we hold each other to. Read and acknowledge.',
    type: 'reading',
    minutes: 5,
    docId: 'code-of-conduct',
    mandatory: true,
  },
]

function storageKey(employeeId: number): string {
  return `meridian.training:${employeeId}`
}

function load(employeeId: number): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(employeeId))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

/** Tracks which training items an employee has completed, persisted locally. */
export function useTrainingProgress(employeeId: number | null) {
  const [done, setDone] = useState<Set<string>>(() =>
    employeeId == null ? new Set() : load(employeeId),
  )

  useEffect(() => {
    setDone(employeeId == null ? new Set() : load(employeeId))
  }, [employeeId])

  const persist = useCallback(
    (next: Set<string>) => {
      setDone(next)
      if (employeeId != null) {
        localStorage.setItem(storageKey(employeeId), JSON.stringify([...next]))
      }
    },
    [employeeId],
  )

  const complete = useCallback(
    (id: string) => {
      const next = new Set(done)
      next.add(id)
      persist(next)
    },
    [done, persist],
  )

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(done)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persist(next)
    },
    [done, persist],
  )

  return { done, complete, toggle }
}
