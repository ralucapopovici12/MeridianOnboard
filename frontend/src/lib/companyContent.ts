// Company-wide home-page content. There's no CMS behind this yet, so it's curated
// here in one place — swap these arrays for an API call when a backend exists.
// Dates are anchored relative to "now" so the feed always looks current.

const DAY = 86_400_000

function isoAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString().slice(0, 10)
}
function isoAhead(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString().slice(0, 10)
}

export interface NewsItem {
  id: string
  title: string
  blurb: string
  date: string // ISO yyyy-mm-dd
  tag: string
}

export interface EventItem {
  id: string
  title: string
  date: string // ISO yyyy-mm-dd
  time: string // friendly, e.g. "10:00" or "All day"
  kind: string
}

export interface ResourceItem {
  id: string // doc slug — see lib/docs
  title: string
  desc: string
}

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Q3 product launch is live',
    blurb: 'The new customer portal shipped to all accounts this morning. Read the rollout notes.',
    date: isoAgo(1),
    tag: 'Product',
  },
  {
    id: 'n2',
    title: 'Expanded dental & vision benefits',
    blurb: 'Open enrolment for the new health plans is now available in the benefits portal.',
    date: isoAgo(4),
    tag: 'Benefits',
  },
  {
    id: 'n3',
    title: 'The 4th floor opens next month',
    blurb: 'More desks, two new meeting rooms and a quiet zone. Seating requests open soon.',
    date: isoAgo(8),
    tag: 'Workplace',
  },
  {
    id: 'n4',
    title: 'Welcome to our new joiners',
    blurb: 'A warm welcome to everyone starting at Meridian this month — say hi in #general.',
    date: isoAgo(12),
    tag: 'People',
  },
]

export const EVENTS: EventItem[] = [
  { id: 'e1', title: 'All-hands: Q3 review', date: isoAhead(2), time: '10:00', kind: 'Company' },
  { id: 'e2', title: 'New-hire coffee meetup', date: isoAhead(4), time: '15:30', kind: 'Social' },
  { id: 'e3', title: 'Security & data-privacy training', date: isoAhead(7), time: '11:00', kind: 'Training' },
  { id: 'e4', title: 'Summer team offsite', date: isoAhead(16), time: 'All day', kind: 'Team' },
]

export const RESOURCES: ResourceItem[] = [
  { id: 'handbook', title: 'Employee handbook', desc: 'How we work, values and the basics' },
  { id: 'hybrid-policy', title: 'Hybrid work policy', desc: '3 days in office, 2 remote' },
  { id: 'time-off', title: 'Time-off & leave', desc: 'Holidays, sick days and requests' },
  { id: 'expenses', title: 'Expense & travel', desc: 'Claims, limits and reimbursement' },
  { id: 'it-security', title: 'IT & security guidelines', desc: 'Accounts, devices and data privacy' },
  { id: 'escalation', title: 'Raising concerns & escalation', desc: 'How to escalate issues and who to contact' },
  { id: 'code-of-conduct', title: 'Code of conduct', desc: 'Our standards and how to raise concerns' },
]
