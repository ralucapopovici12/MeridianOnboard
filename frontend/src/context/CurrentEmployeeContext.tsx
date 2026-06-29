import {
  createContext,
  useCallback,
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
  isAuthenticated: boolean
  /** Verify email + password against the API, then sign in. Throws on failure. */
  login: (email: string, password: string) => Promise<void>
  /** Demo shortcut: sign in as a known employee without a password. */
  quickLogin: (id: number) => void
  logout: () => void
  /** Switch the active employee (used by HR to open a hire's checklist). */
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

  const setCurrentId = useCallback((id: number) => {
    setCurrentIdState(id)
    localStorage.setItem(STORAGE_KEY, String(id))
  }, [])

  const logout = useCallback(() => {
    setCurrentIdState(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const employee = await api.login(email, password)
      setCurrentId(employee.id)
    },
    [setCurrentId],
  )

  // Drop a stale stored id (e.g. after a reseed) once the directory has loaded.
  useEffect(() => {
    if (loading || employees.length === 0 || currentId == null) return
    if (!employees.some((e) => e.id === currentId)) logout()
  }, [loading, employees, currentId, logout])

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
    isAuthenticated: current != null,
    login,
    quickLogin: setCurrentId,
    logout,
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
