export const CPD_MEMBERS = [
  { name: 'Albert Thomas',   email: 'albert.thomas@example.com' },
  { name: 'Jonathan Smith',  email: 'jonathan.smith@example.com' },
  { name: 'Christine Marks', email: 'christine.marks@example.com' },
  { name: 'Jonah Rocks',     email: 'jonah.rocks@example.com' },
  { name: 'Sarah Marks',     email: 'sarah.marks@example.com' },
  { name: 'Marky Jacks',     email: 'marky.jacks@example.com' },
  { name: 'Anthony Carr',    email: 'anthony.carr@example.com' },
  { name: 'Mark Smith',      email: 'mark.smith@example.com' },
  { name: 'Jesse Jackson',   email: 'jesse.jackson@example.com' },
  { name: 'Susan Mann',      email: 'susan.mann@example.com' },
]

export const CPD_TOPICS = [
  {
    area: 'Professionalism & Ethics',
    header: ['Professionalism', '& Ethics'],
    subs: ['Ethics & Professional Standards', 'Conflicts of Interest', 'Professional Conduct'],
  },
  {
    area: 'Client Care & Practice',
    header: ['Client Care', '& Practice'],
    subs: ['Client Engagement', 'Communication Skills', 'Complaints Handling', 'Client Needs Analysis'],
  },
  {
    area: 'Technical Competence',
    header: ['Technical', 'Competence'],
    subs: ['Investment Planning', 'Financial Planning', 'Risk Management', 'Superannuation'],
  },
  {
    area: 'Regulatory & Consumer Protection',
    header: ['Regulatory', '& Consumer Protection'],
    subs: ['Regulatory Compliance', 'Consumer Protection Law', 'Anti-Money Laundering'],
  },
  {
    area: 'General',
    header: ['General'],
    subs: ['Professional Development', 'Leadership & Management', 'Business Skills'],
  },
  {
    area: 'Tax Advice',
    header: ['Tax', 'Advice'],
    subs: ['Tax Planning', 'Tax Compliance', 'Tax Law Updates'],
  },
]

export type Member = { name: string; email: string }

export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem('cpd-members')
    if (raw) return JSON.parse(raw)
  } catch {}
  return CPD_MEMBERS.map(m => ({ name: m.name, email: m.email }))
}

export function saveMembers(members: Member[]) {
  localStorage.setItem('cpd-members', JSON.stringify(members))
}

export const REQUIRED_QUARTERLY_POINTS   = 4.5
export const REQUIRED_HALFYEARLY_POINTS  = 7
export const REQUIRED_YEARLY_POINTS      = 10

export type MemberPoints = Record<string, number>
export type AllPoints = Record<string, MemberPoints>

const DEFAULT_POINTS: Record<string, number> = {
  'Ethics & Professional Standards': 3,
  'Conflicts of Interest': 2,
  'Professional Conduct': 2,
  'Client Engagement': 2,
  'Communication Skills': 2,
  'Complaints Handling': 1,
  'Client Needs Analysis': 2,
  'Investment Planning': 4,
  'Financial Planning': 3,
  'Risk Management': 3,
  'Superannuation': 3,
  'Regulatory Compliance': 2,
  'Consumer Protection Law': 2,
  'Anti-Money Laundering': 1,
  'Professional Development': 2,
  'Leadership & Management': 1,
  'Business Skills': 1,
  'Tax Planning': 2,
  'Tax Compliance': 1,
  'Tax Law Updates': 1,
}

export function createDefaultPoints(): MemberPoints {
  const map: MemberPoints = {}
  CPD_TOPICS.forEach(t => t.subs.forEach(s => { map[s] = DEFAULT_POINTS[s] ?? 0 }))
  return map
}

export function loadAllPoints(): AllPoints {
  const members = loadMembers()
  try {
    const raw = localStorage.getItem('cpd-points')
    if (raw) {
      const stored: AllPoints = JSON.parse(raw)
      const defaults = createDefaultPoints()
      members.forEach(m => {
        if (!stored[m.name] || Object.values(stored[m.name]).every(v => v === 0)) {
          stored[m.name] = { ...defaults }
        }
      })
      return stored
    }
  } catch {}
  return Object.fromEntries(members.map(m => [m.name, createDefaultPoints()]))
}

export function saveAllPoints(points: AllPoints) {
  localStorage.setItem('cpd-points', JSON.stringify(points))
}

export function topicTotal(points: MemberPoints, topic: typeof CPD_TOPICS[0]) {
  return topic.subs.reduce((sum, s) => sum + (points[s] || 0), 0)
}

export function grandTotal(points: MemberPoints) {
  return CPD_TOPICS.reduce((sum, t) => sum + topicTotal(points, t), 0)
}
