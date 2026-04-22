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

export const CPD_KNOWLEDGE_AREAS = [
  { area: 'Professionalism & Ethics',         subs: ['Skills', 'Practice management', 'General knowledge'] },
  { area: 'Client Care & Practice',           subs: ['Aged care', 'Social Security', 'Estate planning'] },
  { area: 'Technical Competence',             subs: ['Super', 'Derivatives', 'Financial planning', 'Retirement income streams', 'Self Managed Super Funds', 'Retirement', 'Securities', 'Managed investments', 'Fixed Interest', 'Margin lending', 'Life Insurance'] },
  { area: 'Regulatory & Consumer Protection', subs: ['Compliance', 'Responsible Manager'] },
  { area: 'General',                          subs: [] },
  { area: 'Tax Advice',                       subs: ['Taxation'] },
]

const DEFAULT_KA_POINTS: Record<string, number> = {
  'Skills': 3, 'Practice management': 3, 'General knowledge': 3,
  'Aged care': 2, 'Social Security': 1, 'Estate planning': 2,
  'Super': 1, 'Derivatives': 0, 'Financial planning': 1,
  'Retirement income streams': 1, 'Self Managed Super Funds': 1, 'Retirement': 0,
  'Securities': 1, 'Managed investments': 1, 'Fixed Interest': 0,
  'Margin lending': 0, 'Life Insurance': 0,
  'Compliance': 3, 'Responsible Manager': 2,
  'Taxation': 5,
}

export function createDefaultKAPoints(): MemberPoints {
  const map: MemberPoints = {}
  CPD_KNOWLEDGE_AREAS.forEach(t => t.subs.forEach(s => { map[s] = DEFAULT_KA_POINTS[s] ?? 0 }))
  return map
}

export function loadAllKAPoints(): AllPoints {
  const members = loadMembers()
  try {
    const raw = localStorage.getItem('cpd-ka-points')
    if (raw) {
      const stored: AllPoints = JSON.parse(raw)
      const defaults = createDefaultKAPoints()
      members.forEach(m => { if (!stored[m.name]) stored[m.name] = { ...defaults } })
      return stored
    }
  } catch {}
  return Object.fromEntries(members.map(m => [m.name, createDefaultKAPoints()]))
}

export function saveAllKAPoints(points: AllPoints) {
  localStorage.setItem('cpd-ka-points', JSON.stringify(points))
}

export function kaTopicTotal(points: MemberPoints, topic: typeof CPD_KNOWLEDGE_AREAS[0]) {
  return topic.subs.reduce((sum, s) => sum + (points[s] || 0), 0)
}

export function kaGrandTotal(points: MemberPoints) {
  return CPD_KNOWLEDGE_AREAS.reduce((sum, t) => sum + kaTopicTotal(points, t), 0)
}

export type TopicConfig = { govtMandated: number; minPerYear: number; enabled: boolean }
export type AllTopicConfig = Record<string, TopicConfig>

export const DEFAULT_TOPIC_CONFIG: AllTopicConfig = {
  'Professionalism & Ethics':        { govtMandated: 9, minPerYear: 9, enabled: true  },
  'Client Care & Practice':          { govtMandated: 5, minPerYear: 5, enabled: true  },
  'Technical Competence':            { govtMandated: 5, minPerYear: 5, enabled: true  },
  'Regulatory & Consumer Protection':{ govtMandated: 5, minPerYear: 5, enabled: true  },
  'General':                         { govtMandated: 0, minPerYear: 0, enabled: true  },
  'Tax Advice':                      { govtMandated: 5, minPerYear: 5, enabled: true  },
}

export function loadTopicConfig(): AllTopicConfig {
  try {
    const raw = localStorage.getItem('cpd-topic-config-v2')
    if (raw) {
      const stored = JSON.parse(raw)
      return Object.fromEntries(
        CPD_TOPICS.map(t => [t.area, { ...DEFAULT_TOPIC_CONFIG[t.area], ...(stored[t.area] ?? {}) }])
      )
    }
  } catch {}
  return { ...DEFAULT_TOPIC_CONFIG }
}
