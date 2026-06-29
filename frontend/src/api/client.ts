import type {
  Employee,
  EmployeeChecklist,
  HrOverviewItem,
  Progress,
  Task,
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
}
