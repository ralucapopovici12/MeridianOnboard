// Company documentation rendered by the DocPage. No CMS yet — content lives here,
// keyed by slug. Resource links and required-reading training items point at these.

export interface DocSection {
  heading?: string
  body?: string[] // paragraphs
  bullets?: string[]
}

export interface Doc {
  id: string // slug, used in the /resources/:id route
  title: string
  summary: string
  updated: string
  readMins: number
  sections: DocSection[]
}

export const DOCS: Record<string, Doc> = {
  handbook: {
    id: 'handbook',
    title: 'Employee Handbook',
    summary: 'How we work at Meridian — values, the basics, and where to find everything else.',
    updated: 'Reviewed June 2026',
    readMins: 6,
    sections: [
      {
        body: [
          'Welcome to Meridian. This handbook is the starting point for how we work together. It links out to the more detailed policies, but the principles here apply everywhere.',
        ],
      },
      {
        heading: 'Our values',
        bullets: [
          'Customers first — we earn trust by solving real problems.',
          'Default to transparency — share context early and often.',
          'Own the outcome — take responsibility end to end.',
          'Be kind and direct — candour with respect.',
        ],
      },
      {
        heading: 'Ways of working',
        body: [
          'We are a hybrid company: 3 days in office and 2 remote (see the Hybrid Work Policy). Core collaboration hours are 10:00–16:00 local time, when most meetings and pairing happen.',
          'We communicate in Slack for day-to-day work, email for formal or external matters, and keep decisions written down in the relevant project space so they outlive any one conversation.',
        ],
      },
      {
        heading: 'Where to find things',
        bullets: [
          'People directory — who does what, in the People tab.',
          'Your onboarding checklist and required training — in My Onboarding.',
          'Policies — linked from the Home page under Policies & resources.',
          'Anything unclear — ask your onboarding buddy or People Operations.',
        ],
      },
    ],
  },

  'hybrid-policy': {
    id: 'hybrid-policy',
    title: 'Hybrid Work Policy',
    summary: 'Our 3-days-office / 2-days-remote model and how to set your schedule.',
    updated: 'Reviewed May 2026',
    readMins: 4,
    sections: [
      {
        body: [
          'Meridian runs a hybrid model: three days in the office and two days remote each week. Time in the office is for collaboration, onboarding, and team building; remote days are for focused work.',
        ],
      },
      {
        heading: 'Choosing your days',
        body: [
          'Pick your three in-office days in My Onboarding under Work Schedule. Most teams anchor at least one shared day so the whole team overlaps in person. Confirm your preferred days with your manager.',
        ],
      },
      {
        heading: 'Expectations',
        bullets: [
          'Be reachable and online during core hours (10:00–16:00).',
          'Keep your calendar and working-location status up to date.',
          'In-office days take priority for team meetings, workshops, and 1:1s.',
          'Occasional changes are fine — just give your team a heads-up.',
        ],
      },
      {
        heading: 'Fully-remote exceptions',
        body: [
          'Some roles and personal circumstances qualify for a different arrangement. These are agreed case by case with your manager and People Operations.',
        ],
      },
    ],
  },

  'time-off': {
    id: 'time-off',
    title: 'Time Off & Leave',
    summary: 'Holidays, sick days, and how to request leave.',
    updated: 'Reviewed June 2026',
    readMins: 5,
    sections: [
      {
        heading: 'Annual leave',
        body: [
          'Full-time employees receive 25 days of paid annual leave per year, plus public holidays. Leave accrues monthly and a small carry-over into the next year is allowed.',
        ],
      },
      {
        heading: 'Requesting time off',
        bullets: [
          'Submit requests as early as you can, especially for peak periods.',
          'Get your manager’s approval before booking travel.',
          'Note your absence in your team calendar and set an out-of-office.',
        ],
      },
      {
        heading: 'Sick leave',
        body: [
          'If you’re unwell, message your manager as early as possible — no doctor’s note is needed for short absences. For anything longer than five consecutive days we’ll ask for a fit note and may arrange support.',
        ],
      },
      {
        heading: 'Other leave',
        bullets: [
          'Parental leave — discuss timing with People Operations well in advance.',
          'Compassionate leave — available when you need it; talk to your manager.',
          'Unpaid leave — considered case by case.',
        ],
      },
    ],
  },

  expenses: {
    id: 'expenses',
    title: 'Expense & Travel Policy',
    summary: 'What you can claim, limits, and how reimbursement works.',
    updated: 'Reviewed April 2026',
    readMins: 4,
    sections: [
      {
        body: [
          'Spend company money as if it were your own: reasonably, and in the company’s interest. When in doubt, ask before you spend.',
        ],
      },
      {
        heading: 'What you can claim',
        bullets: [
          'Work travel — standard-class rail and economy flights.',
          'Accommodation when travelling for work, within city limits.',
          'Team meals and client entertainment, within reason.',
          'Home-office equipment, pre-approved by your manager.',
        ],
      },
      {
        heading: 'How to submit',
        body: [
          'Upload receipts to the expense tool within 30 days of the spend, pick the right category, and add a short note on what it was for. Approved claims are paid with the next payroll run.',
        ],
      },
      {
        heading: 'Not reimbursable',
        bullets: [
          'Fines, penalties, or personal purchases.',
          'Upgrades and extras not agreed in advance.',
          'Anything without a valid receipt.',
        ],
      },
    ],
  },

  'it-security': {
    id: 'it-security',
    title: 'IT & Security Guidelines',
    summary: 'Accounts, devices, and keeping company data safe.',
    updated: 'Reviewed June 2026',
    readMins: 6,
    sections: [
      {
        body: [
          'Security is everyone’s job. These are the baseline rules for every Meridian account and device. The Cybersecurity Essentials training in My Onboarding goes deeper — and is mandatory.',
        ],
      },
      {
        heading: 'Accounts & passwords',
        bullets: [
          'Use the company password manager — unique passwords everywhere.',
          'Turn on multi-factor authentication (MFA) on every account.',
          'Never share credentials, not even with IT.',
        ],
      },
      {
        heading: 'Devices',
        bullets: [
          'Keep your OS and apps up to date; don’t defer security updates.',
          'Lock your screen when you step away.',
          'Only install software from approved sources.',
          'Report lost or stolen devices to IT immediately.',
        ],
      },
      {
        heading: 'Phishing & social engineering',
        body: [
          'Most breaches start with a convincing message. Slow down on anything urgent or unexpected, check the sender, and never enter credentials from a link in an email. Forward suspicious messages to security@meridian.com.',
        ],
      },
      {
        heading: 'Reporting an incident',
        body: [
          'If you think something is wrong — a misclicked link, a leaked file, a strange login — report it straight away to IT or security@meridian.com. Early reporting is always the right call and is never penalised.',
        ],
      },
    ],
  },

  'data-privacy': {
    id: 'data-privacy',
    title: 'Data Privacy & GDPR Basics',
    summary: 'How we handle personal data responsibly and lawfully.',
    updated: 'Reviewed June 2026',
    readMins: 5,
    sections: [
      {
        body: [
          'We handle personal data — about customers, colleagues, and partners — and we’re legally and ethically bound to protect it. This is the short version; the Data Privacy training is mandatory for everyone.',
        ],
      },
      {
        heading: 'Core principles',
        bullets: [
          'Collect only what you need, for a clear purpose.',
          'Keep it accurate and only as long as necessary.',
          'Access data only when your job requires it.',
          'Never move personal data to unapproved tools or personal accounts.',
        ],
      },
      {
        heading: 'If someone exercises their rights',
        body: [
          'People can ask to see, correct, or delete their data. If you receive such a request, don’t action it yourself — forward it to privacy@meridian.com so it’s handled correctly and on time.',
        ],
      },
      {
        heading: 'Breaches',
        body: [
          'A data breach must be reported within hours, not days. If personal data may have been exposed, contact privacy@meridian.com and security@meridian.com immediately.',
        ],
      },
    ],
  },

  'workplace-safety': {
    id: 'workplace-safety',
    title: 'Workplace Health & Safety',
    summary: 'Staying safe in the office and while working from home.',
    updated: 'Reviewed June 2026',
    readMins: 5,
    sections: [
      {
        body: [
          'Everyone deserves a safe place to work. This covers the essentials for both the office and your home setup. The Workplace Health & Safety video in My Onboarding is mandatory.',
        ],
      },
      {
        heading: 'In the office',
        bullets: [
          'Know the nearest fire exits and the assembly point.',
          'Keep walkways and exits clear.',
          'Report spills, hazards, or broken equipment to Facilities.',
          'First-aid kits and trained first-aiders are listed by each kitchen.',
        ],
      },
      {
        heading: 'Fire & evacuation',
        body: [
          'On hearing the alarm, leave calmly by the nearest exit, do not use lifts, and go to the assembly point. Don’t re-enter the building until a fire marshal says it’s safe.',
        ],
      },
      {
        heading: 'Working from home',
        bullets: [
          'Set up your chair, screen, and keyboard to avoid strain.',
          'Take regular screen breaks — roughly five minutes each hour.',
          'Keep cables tidy and your workspace well lit.',
        ],
      },
      {
        heading: 'Reporting an accident',
        body: [
          'Report any accident or near-miss, however minor, to People Operations so we can log it and prevent a repeat. In an emergency, call local emergency services first.',
        ],
      },
    ],
  },

  'code-of-conduct': {
    id: 'code-of-conduct',
    title: 'Code of Conduct',
    summary: 'The standards we hold each other to, and how to raise concerns.',
    updated: 'Reviewed June 2026',
    readMins: 5,
    sections: [
      {
        body: [
          'Our code of conduct sets the standard for how we treat each other, our customers, and our partners. It applies to everyone, everywhere we represent Meridian.',
        ],
      },
      {
        heading: 'What we expect',
        bullets: [
          'Treat everyone with respect and fairness.',
          'No harassment, discrimination, or bullying — ever.',
          'Protect confidential and personal information.',
          'Declare conflicts of interest openly.',
          'Act with integrity, even when no one is watching.',
        ],
      },
      {
        heading: 'Raising a concern',
        body: [
          'If something doesn’t feel right, speak up. You can talk to your manager, People Operations, or use the confidential reporting channel. We do not tolerate retaliation against anyone who raises a concern in good faith.',
        ],
      },
      {
        body: [
          'See Raising Concerns & Escalation Paths for exactly who to contact and what happens next.',
        ],
      },
    ],
  },

  escalation: {
    id: 'escalation',
    title: 'Raising Concerns & Escalation Paths',
    summary: 'How to escalate issues — technical, interpersonal, or ethical — and who to contact.',
    updated: 'Reviewed June 2026',
    readMins: 5,
    sections: [
      {
        body: [
          'Things go wrong — that’s normal. What matters is raising them early and to the right person. This guide explains how to escalate different kinds of issues at Meridian.',
        ],
      },
      {
        heading: 'The general principle',
        body: [
          'Start with the person closest to the problem, give clear context, and say what you need. If it isn’t resolved or it’s urgent, escalate one level up. Escalating is not “going over someone’s head” — it’s how we keep things moving.',
        ],
      },
      {
        heading: 'Work or project blockers',
        bullets: [
          'First: raise it with your team or the relevant owner in the project channel.',
          'Then: your manager, if it’s blocking you or at risk of slipping.',
          'Urgent / production incidents: follow the on-call process and post in #incidents.',
        ],
      },
      {
        heading: 'Technical incidents (outages, security)',
        bullets: [
          'Production outage — post in #incidents and page on-call; don’t wait.',
          'Security issue — email security@meridian.com immediately.',
          'Suspected data breach — security@meridian.com and privacy@meridian.com, within hours.',
        ],
      },
      {
        heading: 'People & conduct concerns',
        bullets: [
          'Talk to your manager, or to People Operations if it involves your manager.',
          'For anything sensitive, use the confidential reporting channel.',
          'Harassment or discrimination is always taken seriously and handled discreetly.',
        ],
      },
      {
        heading: 'Key contacts',
        bullets: [
          'Your manager — day-to-day blockers and priorities.',
          'People Operations — anything HR, conduct, or wellbeing.',
          'security@meridian.com — security and IT incidents.',
          'privacy@meridian.com — personal-data questions and breaches.',
        ],
      },
    ],
  },
}

export function getDoc(id: string): Doc | undefined {
  return DOCS[id]
}
