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
}
