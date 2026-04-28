import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'

import {
  CPD_TOPICS, CPD_KNOWLEDGE_AREAS,
  loadMembers, safeSetItem,
  loadTopicConfig, DEFAULT_TOPIC_CONFIG,
  type Member, type AllTopicConfig,
} from '@/lib/cpdData'

const SUB_TOPICS = CPD_KNOWLEDGE_AREAS.flatMap(t => t.subs)

type SubTopicConfig = Record<string, { govtMandated: number; minPerYear: number }>

const DEFAULT_SUBTOPIC_CONFIG: SubTopicConfig = {
  'Skills':                     { govtMandated: 3, minPerYear: 3 },
  'Practice management':        { govtMandated: 3, minPerYear: 3 },
  'General knowledge':          { govtMandated: 3, minPerYear: 3 },
  'Aged care':                  { govtMandated: 2, minPerYear: 2 },
  'Social Security':            { govtMandated: 1, minPerYear: 1 },
  'Estate planning':            { govtMandated: 2, minPerYear: 2 },
  'Super':                      { govtMandated: 1, minPerYear: 1 },
  'Derivatives':                { govtMandated: 0, minPerYear: 0 },
  'Financial planning':         { govtMandated: 1, minPerYear: 1 },
  'Retirement income streams':  { govtMandated: 1, minPerYear: 1 },
  'Self Managed Super Funds':   { govtMandated: 1, minPerYear: 1 },
  'Retirement':                 { govtMandated: 0, minPerYear: 0 },
  'Securities':                 { govtMandated: 1, minPerYear: 1 },
  'Managed investments':        { govtMandated: 0, minPerYear: 0 },
  'Fixed Interest':             { govtMandated: 0, minPerYear: 0 },
  'Margin lending':             { govtMandated: 0, minPerYear: 0 },
  'Life Insurance':             { govtMandated: 0, minPerYear: 0 },
  'Compliance':                 { govtMandated: 3, minPerYear: 3 },
  'Responsible Manager':        { govtMandated: 2, minPerYear: 2 },
  'Taxation':                   { govtMandated: 5, minPerYear: 5 },
}

function loadSubTopicConfig(): SubTopicConfig {
  try {
    const raw = localStorage.getItem('cpd-subtopic-config')
    if (raw) {
      const stored = JSON.parse(raw)
      return Object.fromEntries(SUB_TOPICS.map(t => [t, { ...DEFAULT_SUBTOPIC_CONFIG[t], ...(stored[t] ?? {}) }]))
    }
  } catch {}
  return { ...DEFAULT_SUBTOPIC_CONFIG }
}

type Period = 'quarterly' | 'half-yearly' | 'yearly'
const PERIOD_DIVISOR: Record<Period, number> = { quarterly: 4, 'half-yearly': 2, yearly: 1 }
const PERIOD_COL_HEADER: Record<Period, string> = { quarterly: 'PTS / QUARTER', 'half-yearly': 'PTS / HALF-YEAR', yearly: 'PTS / YEAR' }
const PERIOD_SHORT: Record<Period, string> = { quarterly: '/ qtr', 'half-yearly': '/ 6mo', yearly: '/ yr' }
const MAJOR_CATEGORY_DISPLAY: Record<string, string> = {
  'Professionalism & Ethics':         'Professionalism & ethics',
  'Client Care & Practice':           'Client care & practice',
  'Technical Competence':             'Technical advice',
  'Regulatory & Consumer Protection': 'Regulatory compliance & consumer protection',
  'General':                          'General',
  'Tax Advice':                       'Tax (financial) advice',
}
const TOTAL_ANNUAL_MIN = 40
function scaledValue(yearly: number, p: Period) { return yearly / PERIOD_DIVISOR[p] }

function paginationItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

const AVATAR_COLORS = [
  { bg: '#dbeafe', fg: '#2563eb' }, { bg: '#dcfce7', fg: '#16a34a' },
  { bg: '#fce7f3', fg: '#db2777' }, { bg: '#fef9c3', fg: '#ca8a04' },
  { bg: '#ede9fe', fg: '#7c3aed' }, { bg: '#fee2e2', fg: '#dc2626' },
  { bg: '#ffedd5', fg: '#ea580c' }, { bg: '#cffafe', fg: '#0891b2' },
]
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function avatarColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default function CpdPlanPage() {
  const [refreshDate, setRefreshDate] = useState(
    () => localStorage.getItem('cpd-refresh-date') ?? '2026-08-01'
  )
  const [editingDate, setEditingDate] = useState(false)
  const [members, setMembers]         = useState<Member[]>(() => loadMembers())

  const PAGE_SIZE = 8

  const [topicConfig, setTopicConfig]       = useState<AllTopicConfig>(() => loadTopicConfig())
  const [subTopicConfig, setSubTopicConfig] = useState<SubTopicConfig>(() => loadSubTopicConfig())
  const [period, setPeriod]                 = useState<Period>('half-yearly')
  const [activeTab, setActiveTab]           = useState<'afsl' | 'individual'>('afsl')
  const [planSaved, setPlanSaved]           = useState(false)

  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [indTopicCfg, setIndTopicCfg]       = useState<AllTopicConfig>({})
  const [indSubCfg, setIndSubCfg]           = useState<SubTopicConfig>({})
  const [savedIndConfigs, setSavedIndConfigs] = useState<Record<string, { tc: AllTopicConfig; sc: SubTopicConfig }>>(() => {
    try { const r = localStorage.getItem('cpd-ind-configs'); return r ? JSON.parse(r) : {} } catch { return {} }
  })
  const [indPage, setIndPage] = useState(1)

  function updateSubTopicConfig(topic: string, field: 'govtMandated' | 'minPerYear', value: number) {
    setSubTopicConfig(prev => {
      const next = { ...prev, [topic]: { ...(prev[topic] ?? { govtMandated: 0, minPerYear: 0 }), [field]: value } }
      safeSetItem('cpd-subtopic-config', JSON.stringify(next))
      return next
    })
  }

  function updateTopicConfig(area: string, field: keyof AllTopicConfig[string], value: number | boolean) {
    setTopicConfig(prev => {
      const next = { ...prev, [area]: { ...(prev[area] ?? DEFAULT_TOPIC_CONFIG[area]), [field]: value } }
      safeSetItem('cpd-topic-config-v2', JSON.stringify(next))
      return next
    })
  }

  function openMember(m: Member) {
    const saved = savedIndConfigs[m.name]
    setIndTopicCfg(saved ? { ...topicConfig, ...saved.tc } : { ...topicConfig })
    setIndSubCfg(saved ? { ...subTopicConfig, ...saved.sc } : { ...subTopicConfig })
    setSelectedMember(m)
  }

  function updateIndTopic(area: string, field: keyof AllTopicConfig[string], value: number | boolean) {
    setIndTopicCfg(prev => ({ ...prev, [area]: { ...(prev[area] ?? DEFAULT_TOPIC_CONFIG[area]), [field]: value } }))
  }

  function updateIndSub(sub: string, value: number) {
    setIndSubCfg(prev => ({ ...prev, [sub]: { ...(prev[sub] ?? { govtMandated: 0, minPerYear: 0 }), minPerYear: value } }))
  }

  function saveIndPlan() {
    if (!selectedMember) return
    const next = { ...savedIndConfigs, [selectedMember.name]: { tc: indTopicCfg, sc: indSubCfg } }
    setSavedIndConfigs(next)
    safeSetItem('cpd-ind-configs', JSON.stringify(next))
    setPlanSaved(true)
    setTimeout(() => setPlanSaved(false), 2000)
  }

  useEffect(() => {
    setMembers(loadMembers())
  }, [])

  const today         = new Date()
  const refreshDt     = new Date(refreshDate + 'T00:00:00')
  const prevRefreshDt = new Date(refreshDt)
  prevRefreshDt.setFullYear(prevRefreshDt.getFullYear() - 1)
  const totalMs       = refreshDt.getTime() - prevRefreshDt.getTime()
  const elapsedMs     = today.getTime() - prevRefreshDt.getTime()
  const daysRemaining = Math.max(0, Math.ceil((refreshDt.getTime() - today.getTime()) / 86400000))
  const gaugeProgress = Math.min(0.999, Math.max(0.001, elapsedMs / totalMs))

  const cx = 143, cy = 148, r = 122, sw = 20
  const angle = (1 - gaugeProgress) * Math.PI
  const ex = cx + r * Math.cos(angle)
  const ey = cy - r * Math.sin(angle)

  const displayDate = refreshDate
    ? new Date(refreshDate + 'T00:00:00').toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const PeriodSelect = () => (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#6b7280]">Reporting period</span>
      <div className="relative">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className="h-8 pl-3 pr-8 border border-[#d0d0d0] rounded-[6px] text-[13px] text-[#0a0a0a] bg-white cursor-pointer focus:outline-none focus:border-[#1182e3] appearance-none"
        >
          <option value="yearly">Annual</option>
          <option value="half-yearly">Biannual</option>
          <option value="quarterly">Quarterly</option>
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b7280]" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>
  )

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings', href: '/settings' }, { label: 'CPD Plan' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4 flex flex-col gap-4">

          {/* Page header */}
          <div className="px-1 pt-1">
            <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider mb-1">CPD Plan Builder</p>
            <h1 className="text-[26px] font-bold text-[#0a0a0a] leading-tight">Meridian Financial Group</h1>
            <p className="text-[13px] text-[#6b7280] mt-1.5">FY 2025–26</p>
          </div>

          {/* Annual Refresh card */}
          <div className="bg-white rounded-[14px] p-4">
            <div className="bg-[#f6f6f6] rounded-[14px] px-4 py-[18px] flex items-center">
              <div className="bg-white rounded-[14px] shrink-0 w-[420px] px-[35px] pt-[33px] pb-[28px] flex flex-col items-center text-center">
                <p className="text-[14px] font-medium text-[#818181]">Next Refresh</p>
                <p className="text-[25px] font-semibold text-[#0a0a0a] mt-1">{displayDate}</p>
                <div className="h-9 flex items-center justify-center mt-3">
                  {editingDate ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={refreshDate}
                        onChange={e => {
                          setRefreshDate(e.target.value)
                          safeSetItem('cpd-refresh-date', e.target.value)
                        }}
                        className="h-9 px-3 border border-[#cacaca] rounded-[6px] text-[14px] text-[#404040] focus:outline-none focus:border-[#1182e3] bg-white"
                      />
                      <button onClick={() => setEditingDate(false)} className="text-[13px] text-[#1182e3] hover:underline">Done</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingDate(true)} className="text-[14px] text-[#1182e3] underline decoration-solid">
                      Change date
                    </button>
                  )}
                </div>
                <p className="text-[14px] text-[#818181] mt-[13px]">CPD points reset annually on this date.</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="relative" style={{ width: 286, height: 160, marginTop: -15 }}>
                  <svg viewBox="0 0 286 160" width="286" height="160">
                    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#bfd8f5" strokeWidth={sw} strokeLinecap="round" />
                    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke="#1182e3" strokeWidth={sw} strokeLinecap="round" />
                  </svg>
                  <div className="absolute left-1/2 flex flex-col items-center" style={{ top: 'calc(52% + 35px)', transform: 'translate(-50%, -50%)' }}>
                    <span style={{ fontSize: 65, fontWeight: 600, color: '#0a0a0a', lineHeight: 1 }}>{daysRemaining}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a', marginTop: 6 }}>days remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Builder */}
          <div className="bg-white rounded-[14px] pt-[19px] pb-[29px] px-[29px] flex flex-col gap-5">

            {/* Tabs */}
            <div className="flex gap-8 border-b border-[#e5e5e5]">
              {([
                { id: 'afsl',       label: 'AFSL default plan' },
                { id: 'individual', label: 'Individual plans'  },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedMember(null) }}
                  className={`pb-3 text-[14px] font-medium transition-colors ${activeTab === tab.id ? 'text-[#0a0a0a] border-b-2 border-[#0a0a0a]' : 'text-[#9ca3af] hover:text-[#6b7280]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AFSL default plan */}
            {activeTab === 'afsl' && (<>
              <PeriodSelect />

              {(() => {
                const planTotal = CPD_TOPICS.reduce((sum, t) => sum + (topicConfig[t.area]?.minPerYear ?? 0), 0)
                const pct = Math.min(100, (planTotal / TOTAL_ANNUAL_MIN) * 100)
                const gap = Math.max(0, TOTAL_ANNUAL_MIN - planTotal)
                return (
                  <div className="bg-[#eff6ff] rounded-[10px] px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[#6b7280]">Annual total across all targets</span>
                      <span className="text-[14px] text-[#0a0a0a]">
                        <span className="font-semibold">{planTotal.toFixed(2)}</span>
                        {' / '}{TOTAL_ANNUAL_MIN.toFixed(2)} pts annual minimum
                      </span>
                    </div>
                    <div className="bg-[#bfdbfe] h-[6px] rounded-full overflow-hidden">
                      <div className="bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[12px] text-[#6b7280] mt-2">
                      Advisers will need {gap.toFixed(2)} additional pts beyond these targets to satisfy the {TOTAL_ANNUAL_MIN.toFixed(2)} pt annual minimum.
                    </p>
                  </div>
                )
              })()}

              <div className="border border-[#e5e5e5] rounded-[10px] overflow-hidden">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="h-10 px-5 text-left text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[40%]">Major Category</th>
                      <th className="h-10 px-5 text-right text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">Leg. Floor (Annual)</th>
                      <th className="h-10 px-5 text-center text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">{PERIOD_COL_HEADER[period]}</th>
                      <th className="h-10 px-5 text-right text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">Annual Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CPD_TOPICS.map((topic, ti) => {
                      const cfg = topicConfig[topic.area] ?? DEFAULT_TOPIC_CONFIG[topic.area]
                      const isTax = topic.area === 'Tax Advice'
                      return (
                        <tr key={topic.area} className={`${ti < CPD_TOPICS.length - 1 ? 'border-b border-[#e5e5e5]' : ''} ${isTax && !cfg.enabled ? 'opacity-40' : ''}`}>
                          <td className="h-[60px] px-5">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#0a0a0a]">{MAJOR_CATEGORY_DISPLAY[topic.area] ?? topic.area}</span>
                              {isTax && (
                                <button
                                  onClick={() => updateTopicConfig(topic.area, 'enabled', !cfg.enabled)}
                                  className={`rounded-full h-5 w-9 flex items-center transition-colors duration-200 shrink-0 ${cfg.enabled ? 'bg-[#1182e3] justify-end pr-0.5' : 'bg-[#d9d9d9] justify-start pl-0.5'}`}
                                >
                                  <div className="bg-white rounded-full w-4 h-4 shadow-sm" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="h-[60px] px-5 text-right text-[#9ca3af]">
                            {cfg.govtMandated > 0 ? `${cfg.govtMandated.toFixed(2)} pts` : 'none'}
                          </td>
                          <td className="h-[60px] px-5">
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number" min="0" step="0.5"
                                value={cfg.minPerYear === 0 ? '' : scaledValue(cfg.minPerYear, period)}
                                onChange={e => updateTopicConfig(topic.area, 'minPerYear', Math.max(0, (parseFloat(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                                placeholder="0.00"
                                disabled={isTax && !cfg.enabled}
                                className="w-16 text-center border border-[#e2e2e2] rounded-[6px] h-8 text-[13px] px-2 focus:outline-none focus:border-[#1182e3] bg-white disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <span className="text-[12px] text-[#9ca3af]">{PERIOD_SHORT[period]}</span>
                            </div>
                          </td>
                          <td className="h-[60px] px-5 text-right font-medium text-[#0a0a0a]">
                            {cfg.minPerYear.toFixed(2)} pts
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {(() => {
                const half = Math.ceil(SUB_TOPICS.length / 2)
                const leftSubs  = SUB_TOPICS.slice(0, half)
                const rightSubs = SUB_TOPICS.slice(half)
                const rows = Math.max(leftSubs.length, rightSubs.length)
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider">Subtopics — optional targets {PERIOD_SHORT[period]}</span>
                      <span className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider">Leave blank to apply no minimum</span>
                    </div>
                    <div className="border border-[#e5e5e5] rounded-[10px] overflow-hidden">
                      <div className="divide-y divide-[#e5e5e5]">
                        {Array.from({ length: rows }, (_, i) => (
                          <div key={i} className="grid grid-cols-2 divide-x divide-[#e5e5e5]">
                            {[leftSubs[i], rightSubs[i]].map((sub, col) => {
                              if (!sub) return <div key={col} />
                              const cfg = subTopicConfig[sub] ?? { govtMandated: 0, minPerYear: 0 }
                              return (
                                <div key={sub} className="flex items-center justify-between px-4 py-[10px]">
                                  <span className="text-[13px] text-[#0a0a0a]">{sub}</span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number" min="0" step="0.5"
                                      value={scaledValue(cfg.minPerYear, period) || ''}
                                      onChange={e => updateSubTopicConfig(sub, 'minPerYear', Math.max(0, (parseFloat(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                                      placeholder="—"
                                      className="w-12 text-center border border-[#e2e2e2] rounded-[5px] h-[28px] text-[12px] px-1 focus:outline-none focus:border-[#1182e3] bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <span className="text-[12px] text-[#9ca3af]">{PERIOD_SHORT[period]}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div className="flex justify-end">
                <button
                  onClick={() => { setPlanSaved(true); setTimeout(() => setPlanSaved(false), 2000) }}
                  className="h-10 px-8 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-white text-[14px] font-medium rounded-[8px] transition-colors"
                >
                  {planSaved ? '✓ Saved' : 'Save plan'}
                </button>
              </div>
            </>)}

            {/* Individual plans — member list */}
            {activeTab === 'individual' && !selectedMember && (() => {
              const indTotalPages = Math.ceil(members.length / PAGE_SIZE)
              const indPageItems  = members.slice((indPage - 1) * PAGE_SIZE, indPage * PAGE_SIZE)
              return (
                <>
                  <div className="border border-[#e5e5e5] rounded-[10px] overflow-hidden divide-y divide-[#e5e5e5]">
                    {indPageItems.map(m => {
                      const hasCustom = !!savedIndConfigs[m.name]
                      const av = avatarColor(m.name)
                      return (
                        <button key={m.name} onClick={() => openMember(m)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f9fafb] transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold" style={{ background: av.bg, color: av.fg }}>
                              {getInitials(m.name)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] text-[#0a0a0a] font-medium">{m.name}</span>
                              <span className="text-[12px] text-[#9ca3af]">{m.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${hasCustom ? 'bg-[#eff6ff] text-[#1182e3]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
                              {hasCustom ? 'Custom' : 'AFSL default'}
                            </span>
                            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {indTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">
                        Showing {(indPage - 1) * PAGE_SIZE + 1}–{Math.min(indPage * PAGE_SIZE, members.length)} of {members.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIndPage(p => Math.max(1, p - 1))}
                          disabled={indPage === 1}
                          className="h-8 px-3 text-[12px] border border-[#e2e2e2] rounded-[6px] disabled:opacity-40 hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                          Previous
                        </button>
                        {paginationItems(indPage, indTotalPages).map((p, i) =>
                          p === '…' ? (
                            <span key={`e${i}`} className="px-1 text-[12px] text-[#737373]">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setIndPage(p as number)}
                              className={`h-8 w-8 text-[12px] rounded-[6px] border transition-colors ${indPage === p ? 'border-[#1182e3] text-[#1182e3] font-medium' : 'border-[#e2e2e2] hover:bg-gray-50'}`}
                            >
                              {p}
                            </button>
                          )
                        )}
                        <button
                          onClick={() => setIndPage(p => Math.min(indTotalPages, p + 1))}
                          disabled={indPage === indTotalPages}
                          className="h-8 px-3 text-[12px] border border-[#e2e2e2] rounded-[6px] disabled:opacity-40 hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          Next
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}

            {/* Individual plans — detail view */}
            {activeTab === 'individual' && selectedMember && (<>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[13px] -mt-1">
                <button onClick={() => setSelectedMember(null)} className="flex items-center gap-1 text-[#6b7280] hover:text-[#0a0a0a] transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  All advisers
                </button>
                <span className="text-[#d0d0d0]">·</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0" style={{ background: avatarColor(selectedMember.name).bg, color: avatarColor(selectedMember.name).fg }}>
                    {getInitials(selectedMember.name)}
                  </div>
                  <span className="text-[#0a0a0a] font-medium">{selectedMember.name}</span>
                </div>
                <span className="text-[#d0d0d0]">·</span>
                <span className="text-[#9ca3af]">Individual plan</span>
              </div>

              <p className="text-[13px] text-[#6b7280] bg-[#f9fafb] border border-[#e5e5e5] rounded-[8px] px-4 py-3">
                Pre-filled with AFSL defaults. Edit any value to override. Modified fields are highlighted in blue.
              </p>

              <PeriodSelect />

              {(() => {
                const planTotal = CPD_TOPICS.reduce((sum, t) => sum + (indTopicCfg[t.area]?.minPerYear ?? 0), 0)
                const pct = Math.min(100, (planTotal / TOTAL_ANNUAL_MIN) * 100)
                const gap = Math.max(0, TOTAL_ANNUAL_MIN - planTotal)
                return (
                  <div className="bg-[#eff6ff] rounded-[10px] px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[#6b7280]">Annual total across all targets</span>
                      <span className="text-[14px] text-[#0a0a0a]">
                        <span className="font-semibold">{planTotal.toFixed(2)}</span>
                        {' / '}{TOTAL_ANNUAL_MIN.toFixed(2)} pts annual minimum
                      </span>
                    </div>
                    <div className="bg-[#bfdbfe] h-[6px] rounded-full overflow-hidden">
                      <div className="bg-[#2563eb] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[12px] text-[#6b7280] mt-2">
                      Advisers will need {gap.toFixed(2)} additional pts beyond these targets to satisfy the {TOTAL_ANNUAL_MIN.toFixed(2)} pt annual minimum.
                    </p>
                  </div>
                )
              })()}

              <div className="border border-[#e5e5e5] rounded-[10px] overflow-hidden">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="h-10 px-5 text-left text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[40%]">Major Category</th>
                      <th className="h-10 px-5 text-right text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">Leg. Floor (Annual)</th>
                      <th className="h-10 px-5 text-center text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">{PERIOD_COL_HEADER[period]}</th>
                      <th className="h-10 px-5 text-right text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider w-[20%]">Annual Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CPD_TOPICS.map((topic, ti) => {
                      const cfg = indTopicCfg[topic.area] ?? DEFAULT_TOPIC_CONFIG[topic.area]
                      const defaultCfg = topicConfig[topic.area] ?? DEFAULT_TOPIC_CONFIG[topic.area]
                      const isModified = cfg.minPerYear !== defaultCfg.minPerYear
                      const isTax = topic.area === 'Tax Advice'
                      return (
                        <tr key={topic.area} className={`${ti < CPD_TOPICS.length - 1 ? 'border-b border-[#e5e5e5]' : ''} ${isTax && !cfg.enabled ? 'opacity-40' : ''}`}>
                          <td className="h-[60px] px-5">
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${isModified ? 'text-[#1182e3]' : 'text-[#0a0a0a]'}`}>{MAJOR_CATEGORY_DISPLAY[topic.area] ?? topic.area}</span>
                              {isTax && (
                                <button
                                  onClick={() => updateIndTopic(topic.area, 'enabled', !cfg.enabled)}
                                  className={`rounded-full h-5 w-9 flex items-center transition-colors duration-200 shrink-0 ${cfg.enabled ? 'bg-[#1182e3] justify-end pr-0.5' : 'bg-[#d9d9d9] justify-start pl-0.5'}`}
                                >
                                  <div className="bg-white rounded-full w-4 h-4 shadow-sm" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="h-[60px] px-5 text-right text-[#9ca3af]">
                            {cfg.govtMandated > 0 ? `${cfg.govtMandated.toFixed(2)} pts` : 'none'}
                          </td>
                          <td className="h-[60px] px-5">
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number" min="0" step="0.5"
                                value={cfg.minPerYear === 0 ? '' : scaledValue(cfg.minPerYear, period)}
                                onChange={e => updateIndTopic(topic.area, 'minPerYear', Math.max(0, (parseFloat(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                                placeholder="0.00"
                                disabled={isTax && !cfg.enabled}
                                className={`w-16 text-center border rounded-[6px] h-8 text-[13px] px-2 focus:outline-none bg-white disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isModified ? 'border-[#1182e3] bg-[#eff6ff] text-[#1182e3] focus:border-[#1182e3]' : 'border-[#e2e2e2] focus:border-[#1182e3]'}`}
                              />
                              <span className="text-[12px] text-[#9ca3af]">{PERIOD_SHORT[period]}</span>
                            </div>
                          </td>
                          <td className={`h-[60px] px-5 text-right font-medium ${isModified ? 'text-[#1182e3]' : 'text-[#0a0a0a]'}`}>
                            {cfg.minPerYear.toFixed(2)} pts
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {(() => {
                const half = Math.ceil(SUB_TOPICS.length / 2)
                const leftSubs  = SUB_TOPICS.slice(0, half)
                const rightSubs = SUB_TOPICS.slice(half)
                const rows = Math.max(leftSubs.length, rightSubs.length)
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider">Subtopics — optional targets {PERIOD_SHORT[period]}</span>
                      <span className="text-[10px] font-medium text-[#9ca3af] uppercase tracking-wider">Leave blank to apply no minimum</span>
                    </div>
                    <div className="border border-[#e5e5e5] rounded-[10px] overflow-hidden">
                      <div className="divide-y divide-[#e5e5e5]">
                        {Array.from({ length: rows }, (_, i) => (
                          <div key={i} className="grid grid-cols-2 divide-x divide-[#e5e5e5]">
                            {[leftSubs[i], rightSubs[i]].map((sub, col) => {
                              if (!sub) return <div key={col} />
                              const cfg = indSubCfg[sub] ?? { govtMandated: 0, minPerYear: 0 }
                              const defaultCfg = subTopicConfig[sub] ?? { govtMandated: 0, minPerYear: 0 }
                              const isModified = cfg.minPerYear !== defaultCfg.minPerYear
                              return (
                                <div key={sub} className="flex items-center justify-between px-4 py-[10px]">
                                  <span className={`text-[13px] ${isModified ? 'text-[#1182e3]' : 'text-[#0a0a0a]'}`}>{sub}</span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number" min="0" step="0.5"
                                      value={scaledValue(cfg.minPerYear, period) || ''}
                                      onChange={e => updateIndSub(sub, Math.max(0, (parseFloat(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                                      placeholder="—"
                                      className={`w-12 text-center border rounded-[5px] h-[28px] text-[12px] px-1 focus:outline-none bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isModified ? 'border-[#1182e3] bg-[#eff6ff] text-[#1182e3] focus:border-[#1182e3]' : 'border-[#e2e2e2] focus:border-[#1182e3]'}`}
                                    />
                                    <span className="text-[12px] text-[#9ca3af]">{PERIOD_SHORT[period]}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div className="flex justify-end">
                <button
                  onClick={saveIndPlan}
                  className="h-10 px-8 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-white text-[14px] font-medium rounded-[8px] transition-colors"
                >
                  {planSaved ? '✓ Saved' : 'Save plan'}
                </button>
              </div>
            </>)}

          </div>

        </main>
      </div>
    </div>
  )
}
