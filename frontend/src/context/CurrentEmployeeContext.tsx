import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import type { Employee } from '../api/types'
import { useAsync } from '../lib/useAsync'

const STORAGE_KEY = 'meridian.currentEmployeeId'

interface CurrentEmployeeValue {
  employees: Employee[]
  loading: boolean
  error: string | null
  currentId: number | null
  current: Employee | null
  setCurrentId: (id: number) => void
}

const CurrentEmployeeContext = createContext<CurrentEmployeeValue | null>(null)

export function CurrentEmployeeProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useAsync(() => api.getEmployees(), [])
  const employees = useMemo(() => data ?? [], [data])

  const [currentId, setCurrentIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : null
  })

  const setCurrentId = (id: number) => {
    setCurrentIdState(id)
    localStorage.setItem(STORAGE_KEY, String(id))
  }

  // Once employees load, make sure we have a sensible selection.
  // Default to the newest hire so the demo opens on a live onboarding checklist.
  useEffect(() => {
    if (employees.length === 0) return
    const stillValid = currentId != null && employees.some((e) => e.id === currentId)
    if (stillValid) return

    const firstNewHire = employees.find((e) => e.isNewHire)
    setCurrentIdState((firstNewHire ?? employees[0]).id)
  }, [employees, currentId])

  const current = useMemo(
    () => employees.find((e) => e.id === currentId) ?? null,
    [employees, currentId],
  )

  const value: CurrentEmployeeValue = {
    employees,
    loading,
    error,
    currentId,
    current,
    setCurrentId,
  }

  return (
    <CurrentEmployeeContext.Provider value={value}>
      {children}
    </CurrentEmployeeContext.Provider>
  )
}

export function useCurrentEmployee(): CurrentEmployeeValue {
  const ctx = useContext(CurrentEmployeeContext)
  if (!ctx) {
    throw new Error('useCurrentEmployee must be used within CurrentEmployeeProvider')
  }
  return ctx
}
