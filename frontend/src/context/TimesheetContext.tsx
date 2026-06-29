import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import type { Timesheet } from '../api/types'
import { useCurrentEmployee } from './CurrentEmployeeContext'

interface TimesheetValue {
  sheet: Timesheet | null
  loading: boolean
  busy: boolean
  clockIn: (location: string) => Promise<void>
  clockOut: () => Promise<void>
  setLocation: (location: string) => Promise<void>
  reload: () => void
}

const TimesheetContext = createContext<TimesheetValue | null>(null)

export function TimesheetProvider({ children }: { children: ReactNode }) {
  const { currentId } = useCurrentEmployee()

  const [sheet, setSheet] = useState<Timesheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    if (currentId == null) return
    let active = true
    setLoading(true)
    api
      .getTimesheet(currentId)
      .then((ts) => active && setSheet(ts))
      .catch(() => active && setSheet(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentId])

  useEffect(reload, [reload])

  // Wraps a mutating clock action: run it, adopt the returned sheet, guard re-entry.
  const run = useCallback(
    async (fn: (id: number) => Promise<Timesheet>) => {
      if (currentId == null || busy) return
      setBusy(true)
      try {
        setSheet(await fn(currentId))
      } catch {
        /* leave current state; a reload will resync */
      } finally {
        setBusy(false)
      }
    },
    [currentId, busy],
  )

  const value: TimesheetValue = {
    sheet,
    loading,
    busy,
    clockIn: (location) => run((id) => api.clockIn(id, location)),
    clockOut: () => run((id) => api.clockOut(id)),
    setLocation: (location) => run((id) => api.setTimesheetLocation(id, location)),
    reload,
  }

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>
}

export function useTimesheet(): TimesheetValue {
  const ctx = useContext(TimesheetContext)
  if (!ctx) {
    throw new Error('useTimesheet must be used within TimesheetProvider')
  }
  return ctx
}
