import type {
  Board,
  BoardTask,
  Employee,
  EmployeeChecklist,
  HrOverviewItem,
  Progress,
  Task,
  Timesheet,
} from './types'

// Requests go to "/api/...", which Vite proxies to the backend on :5000 (see vite.config.ts).
const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<Employee>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  getEmployees: () => request<Employee[]>('/employees'),
  getChecklist: (employeeId: number) =>
    request<EmployeeChecklist>(`/employees/${employeeId}/tasks`),
  getProgress: (employeeId: number) =>
    request<Progress>(`/employees/${employeeId}/progress`),
  toggleTask: (taskId: number) =>
    request<Task>(`/tasks/${taskId}/toggle`, { method: 'PATCH' }),
  getHrOverview: () => request<HrOverviewItem[]>('/hr/overview'),
  updateSchedule: (employeeId: number, officeDays: number[]) =>
    request<Employee>(`/employees/${employeeId}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officeDays }),
    }),

  // Time clock
  getTimesheet: (employeeId: number) =>
    request<Timesheet>(`/employees/${employeeId}/timesheet`),
  clockIn: (employeeId: number, location?: string) =>
    request<Timesheet>(`/employees/${employeeId}/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: location ?? null }),
    }),
  clockOut: (employeeId: number) =>
    request<Timesheet>(`/employees/${employeeId}/clock-out`, { method: 'POST' }),
  setTimesheetLocation: (employeeId: number, location: string) =>
    request<Timesheet>(`/employees/${employeeId}/timesheet/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    }),

  // Personal task board
  getBoard: (employeeId: number) =>
    request<Board>(`/employees/${employeeId}/board`),
  getTeamBoard: (employeeId: number) =>
    request<Board>(`/employees/${employeeId}/team-board`),
  moveBoardTask: (taskId: number, status: string) =>
    request<BoardTask>(`/board-tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
}
