// Mirrors the DTOs returned by the ASP.NET Core API.

export interface Employee {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string
  department: string
  departmentId: number
  startDate: string // ISO date (yyyy-MM-dd)
  isHR: boolean
  currentProject: string | null
  isNewHire: boolean
  officeDays: number[] | null // 1=Mon … 5=Fri; null = not set yet
  avatarUrl: string // bundled portrait, e.g. "/avatars/andrei.popa.jpg"
}

export interface Progress {
  completed: number
  total: number
  percent: number
}

export interface Task {
  id: number
  title: string
  phase: string
  phaseLabel: string
  isCompleted: boolean
  completedAt: string | null
  orderIndex: number
}

export interface PhaseGroup {
  phase: string
  label: string
  completed: number
  total: number
  tasks: Task[]
}

export interface EmployeeChecklist {
  employeeId: number
  fullName: string
  role: string
  department: string
  startDate: string
  progress: Progress
  groups: PhaseGroup[]
  officeDays: number[] | null
}

export interface HrOverviewItem {
  employeeId: number
  fullName: string
  role: string
  department: string
  startDate: string
  daysToStart: number
  status: string
  currentPhaseLabel: string
  progress: Progress
  avatarUrl: string
}

// --- Time clock ("pontaj") ---

export interface TimeEntry {
  id: number
  date: string // ISO date
  dateLabel: string
  clockIn: string // ISO datetime
  clockOut: string | null
  location: string // "Office" | "Remote"
  minutes: number | null
}

export interface Timesheet {
  employeeId: number
  todayLabel: string
  todayLocation: string // planned location for today
  isClockedIn: boolean
  today: TimeEntry | null
  recent: TimeEntry[]
}

// --- Personal task board ---

export interface BoardTask {
  id: number
  key: string // e.g. "MER-12"
  title: string
  status: string // "Backlog" | "Todo" | "InProgress" | "InReview" | "Done"
  priority: string // "Low" | "Medium" | "High" | "Urgent"
  tag: string | null
  orderIndex: number
  assigneeId: number
  assigneeName: string // person who owns this ticket
  assigneeAvatarUrl: string // photo for the assignee
}

export interface BoardColumn {
  status: string
  label: string
  tasks: BoardTask[]
}

export interface Board {
  employeeId: number
  columns: BoardColumn[]
}
