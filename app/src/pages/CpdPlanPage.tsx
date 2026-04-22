import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'

import {
  CPD_TOPICS, CPD_KNOWLEDGE_AREAS,
  loadAllKAPoints, kaTopicTotal, kaGrandTotal,
  loadMembers,
  REQUIRED_QUARTERLY_POINTS, REQUIRED_HALFYEARLY_POINTS, REQUIRED_YEARLY_POINTS,
  loadTopicConfig, DEFAULT_TOPIC_CONFIG,
  type AllPoints, type Member, type AllTopicConfig,
} from '@/lib/cpdData'

const SUB_TOPICS = CPD_KNOWLEDGE_AREAS.flatMap(t => t.subs)

const AREA_COLORS: Record<string, string> = {
  'Professionalism & Ethics':        '#bfdbfe',
  'Client Care & Practice':          '#bbf7d0',
  'Technical Competence':            '#fed7aa',
  'Regulatory & Consumer Protection':'#e9d5ff',
  'Tax Advice':                      '#fbcfe8',
}
const SUBTOPIC_BG: Record<string, string> = {}
CPD_KNOWLEDGE_AREAS.forEach(t => t.subs.forEach(s => { SUBTOPIC_BG[s] = AREA_COLORS[t.area] ?? '#f6f6f6' }))

type SubTopicConfig = Record<string, { govtMandated: number; minPerYear: number }>

const DEFAULT_SUBTOPIC_CONFIG: SubTopicConfig = {
  // Professionalism & Ethics (9 pts)
  'Skills':                     { govtMandated: 3, minPerYear: 3 },
  'Practice management':        { govtMandated: 3, minPerYear: 3 },
  'General knowledge':          { govtMandated: 3, minPerYear: 3 },
  // Client Care & Practice (5 pts)
  'Aged care':                  { govtMandated: 2, minPerYear: 2 },
  'Social Security':            { govtMandated: 1, minPerYear: 1 },
  'Estate planning':            { govtMandated: 2, minPerYear: 2 },
  // Technical Competence (5 pts)
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
  // Regulatory & Consumer Protection (5 pts)
  'Compliance':                 { govtMandated: 3, minPerYear: 3 },
  'Responsible Manager':        { govtMandated: 2, minPerYear: 2 },
  // Tax Advice (5 pts)
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
const PERIOD_LABELS: Record<Period, string> = { quarterly: 'Quarterly', 'half-yearly': '6 Months', yearly: 'Yearly' }
const PERIOD_SUFFIX: Record<Period, string> = { quarterly: 'Per Quarter', 'half-yearly': 'Per 6 Months', yearly: 'Per Year' }
const PERIOD_DIVISOR: Record<Period, number> = { quarterly: 4, 'half-yearly': 2, yearly: 1 }
function scaledValue(yearly: number, p: Period) { return Math.ceil(yearly / PERIOD_DIVISOR[p]) }

function splitTitle(title: string): string {
  const words = title.split(' ')
  if (words.length <= 2) return title
  const mid = Math.ceil(words.length / 2)
  return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ')
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none" className="shrink-0">
      <path d="M5 1L5 13M5 1L2 4M5 1L8 4" stroke={active && dir === 'asc' ? '#1182e3' : '#c0c0c0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13L2 10M5 13L8 10" stroke={active && dir === 'desc' ? '#1182e3' : '#c0c0c0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function CpdPlanPage() {
  const navigate = useNavigate()
  const [refreshDate, setRefreshDate] = useState(
    () => localStorage.getItem('cpd-refresh-date') ?? '2026-08-01'
  )
  const [editingDate, setEditingDate] = useState(false)
  const [members, setMembers]         = useState<Member[]>(() => loadMembers())
  const [allPoints, setAllPoints]     = useState<AllPoints>(() => loadAllKAPoints())

  const [sortKey, setSortKey]   = useState<string>('_default')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 8

  const [topicConfig, setTopicConfig]   = useState<AllTopicConfig>(() => loadTopicConfig())
  const [subTopicConfig, setSubTopicConfig] = useState<SubTopicConfig>(() => loadSubTopicConfig())
  const [period, setPeriod]             = useState<Period>('yearly')
  const [periodOpen, setPeriodOpen]   = useState(false)
  const periodRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function updateSubTopicConfig(topic: string, field: 'govtMandated' | 'minPerYear', value: number) {
    setSubTopicConfig(prev => {
      const next = { ...prev, [topic]: { ...(prev[topic] ?? { govtMandated: 0, minPerYear: 0 }), [field]: value } }
      localStorage.setItem('cpd-subtopic-config', JSON.stringify(next))
      return next
    })
  }

  function updateTopicConfig(area: string, field: keyof TopicConfig, value: number | boolean) {
    setTopicConfig(prev => {
      const next = { ...prev, [area]: { ...(prev[area] ?? DEFAULT_TOPIC_CONFIG[area]), [field]: value } }
      localStorage.setItem('cpd-topic-config-v2', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    setMembers(loadMembers())
    setAllPoints(loadAllKAPoints())
  }, [])

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sortedMembers = useMemo(() => {
    if (sortKey === '_default') return [...members].reverse()
    return [...members].sort((a, b) => {
      const ptsA = allPoints[a.name] ?? {}
      const ptsB = allPoints[b.name] ?? {}
      let va: string | number
      let vb: string | number
      if (sortKey === 'name')  { va = a.name;  vb = b.name }
      else if (sortKey === 'email') { va = a.email; vb = b.email }
      else if (sortKey === 'total') { va = kaGrandTotal(ptsA); vb = kaGrandTotal(ptsB) }
      else {
        const topic = CPD_KNOWLEDGE_AREAS.find(t => t.area === sortKey)
        va = topic ? kaTopicTotal(ptsA, topic) : 0
        vb = topic ? kaTopicTotal(ptsB, topic) : 0
      }
      const cmp = typeof va === 'number' ? va - (vb as number) : (va as string).localeCompare(vb as string)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [members, allPoints, sortKey, sortDir])

  const totalPages = Math.ceil(sortedMembers.length / PAGE_SIZE)
  const pageItems  = sortedMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Gauge: filled = elapsed portion of year
  const today         = new Date()
  const refreshDt     = new Date(refreshDate + 'T00:00:00')
  const prevRefreshDt = new Date(refreshDt)
  prevRefreshDt.setFullYear(prevRefreshDt.getFullYear() - 1)
  const totalMs       = refreshDt.getTime() - prevRefreshDt.getTime()
  const elapsedMs     = today.getTime() - prevRefreshDt.getTime()
  const daysRemaining = Math.max(0, Math.ceil((refreshDt.getTime() - today.getTime()) / 86400000))
  const gaugeProgress = Math.min(0.999, Math.max(0.001, elapsedMs / totalMs))

  // SVG semicircle gauge params
  const cx = 143, cy = 148, r = 122, sw = 20
  const angle = (1 - gaugeProgress) * Math.PI
  const ex = cx + r * Math.cos(angle)
  const ey = cy - r * Math.sin(angle)

  const displayDate = refreshDate
    ? new Date(refreshDate + 'T00:00:00').toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const quarterly = REQUIRED_QUARTERLY_POINTS
  const half      = REQUIRED_HALFYEARLY_POINTS
  const yearly    = REQUIRED_YEARLY_POINTS

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings', href: '/settings' }, { label: 'CPD Plan' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4 flex flex-col gap-4">

          {/* Annual Refresh + Accumulation cards */}
          <div className="bg-white rounded-[14px] pt-[19px] pb-[29px] px-[29px] flex flex-col gap-[15px]">
            <h2 className="text-[20px] font-semibold text-[#0a0a0a]">CPD Plan</h2>

            {/* Gray refresh box: date card + gauge */}
            <div className="bg-[#f6f6f6] rounded-[14px] px-4 py-[18px] flex items-center">

              {/* Left: white date card */}
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
                          localStorage.setItem('cpd-refresh-date', e.target.value)
                        }}
                        className="h-9 px-3 border border-[#cacaca] rounded-[6px] text-[14px] text-[#404040] focus:outline-none focus:border-[#1182e3] bg-white"
                      />
                      <button onClick={() => setEditingDate(false)} className="text-[13px] text-[#1182e3] hover:underline">Done</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingDate(true)}
                      className="text-[14px] text-[#1182e3] underline decoration-solid"
                    >
                      Change date
                    </button>
                  )}
                </div>
                <p className="text-[14px] text-[#818181] mt-[13px]">CPD points reset annually on this date.</p>
              </div>

              {/* Right: gauge */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative" style={{ width: 286, height: 160, marginTop: -15 }}>
                  <svg viewBox="0 0 286 160" width="286" height="160">
                    {/* Track */}
                    <path
                      d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                      fill="none" stroke="#bfd8f5" strokeWidth={sw} strokeLinecap="round"
                    />
                    {/* Elapsed fill */}
                    <path
                      d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`}
                      fill="none" stroke="#1182e3" strokeWidth={sw} strokeLinecap="round"
                    />
                  </svg>
                  {/* Days remaining overlay */}
                  <div
                    className="absolute left-1/2 flex flex-col items-center"
                    style={{ top: 'calc(52% + 35px)', transform: 'translate(-50%, -50%)' }}
                  >
                    <span style={{ fontSize: 65, fontWeight: 600, color: '#0a0a0a', lineHeight: 1 }}>
                      {daysRemaining}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a', marginTop: 6 }}>
                      days remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Topic Requirements */}
          <div className="bg-white rounded-[14px] pt-[19px] pb-[29px] px-[29px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">Major Topic</h2>
              {/* Period selector */}
              <div className="relative" ref={periodRef}>
                <button
                  onClick={() => setPeriodOpen(o => !o)}
                  className="flex items-center gap-2 h-[36px] pl-[13px] pr-[13px] border border-[#d0d0d0] rounded-[8px] bg-white text-[14px] font-medium text-[#0a0a0a]"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {PERIOD_LABELS[period]}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {periodOpen && (
                  <div className="absolute right-0 top-[40px] bg-white border border-[#e2e2e2] rounded-[8px] shadow-lg z-10 w-[140px] overflow-hidden">
                    {(['quarterly', 'half-yearly', 'yearly'] as Period[]).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPeriod(p); setPeriodOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${period === p ? 'text-[#1182e3] font-medium' : 'text-[#404040]'}`}
                      >
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {CPD_TOPICS.map(topic => {
                const cfg = topicConfig[topic.area] ?? DEFAULT_TOPIC_CONFIG[topic.area]
                const isTax = topic.area === 'Tax Advice'
                return (
                  <div
                    key={topic.area}
                    className={`bg-[#f6f6f6] rounded-[20px] p-4 flex flex-col gap-3 transition-opacity ${isTax && !cfg.enabled ? 'opacity-50' : ''}`}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between min-h-[41px]">
                      <p className="text-[16px] font-medium text-[#0a0a0a] leading-[1.3] whitespace-pre-line">{splitTitle(topic.area)}</p>
                      {isTax && (
                        <button
                          onClick={() => updateTopicConfig(topic.area, 'enabled', !cfg.enabled)}
                          className={`rounded-full h-[22px] w-[42px] flex items-center transition-colors duration-200 shrink-0 mt-0.5 ${cfg.enabled ? 'bg-[#1182e3] justify-end pr-[3px]' : 'bg-[#d9d9d9] justify-start pl-[3px]'}`}
                        >
                          <div className="bg-white rounded-full w-[16px] h-[16px] shadow-sm" />
                        </button>
                      )}
                    </div>

                    {/* Two editable white boxes */}
                    <div className="flex gap-2">
                      {[
                        { field: 'govtMandated' as const, label: 'Govt Mandated\nMinimum Points' },
                        { field: 'minPerYear'    as const, label: `Minimum Points\n${PERIOD_SUFFIX[period]}` },
                      ].map(({ field, label }) => (
                        <div key={field} className="group bg-white rounded-[8px] flex-1 h-[100px] flex flex-col items-center justify-center gap-1 px-1 border border-transparent hover:border-[#d0d0d0] focus-within:border-[#1182e3] transition-colors cursor-text">
                          <input
                            type="number"
                            min="0"
                            value={cfg[field] === 0 ? '' : scaledValue(cfg[field], period)}
                            onChange={e => updateTopicConfig(topic.area, field, Math.max(0, (parseInt(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                            placeholder="0"
                            disabled={isTax && !cfg.enabled}
                            className="w-full text-center text-[37px] font-semibold text-[#1182e3] bg-transparent outline-none tracking-[-1px] leading-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <p className="text-[11px] text-[#2b2b2b] text-center leading-[14px] whitespace-pre-line">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Bottom blue summary box */}
                    <div className="bg-[rgba(17,130,227,0.1)] border border-[#1182e3] rounded-[8px] h-[80px] flex items-center justify-between px-4">
                      <p className="text-[14px] font-medium text-[#0a0a0a] leading-[1.4]">Minimum Points<br/>Per Year</p>
                      <p className="text-[37px] font-semibold text-[#1182e3] tracking-[-1px]">{cfg.minPerYear}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sub-topic Requirements */}
          <div className="bg-white rounded-[14px] pt-[19px] pb-[29px] px-[29px] flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">Sub-topic</h2>
              <div className="flex flex-wrap justify-end gap-x-4 gap-y-1.5">
                {CPD_KNOWLEDGE_AREAS.filter(t => t.subs.length > 0).map(t => (
                  <div key={t.area} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-[3px] shrink-0" style={{ background: AREA_COLORS[t.area] }} />
                    <span className="text-[11px] text-[#404040] whitespace-nowrap">{t.area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SUB_TOPICS.map(sub => {
                const cfg = subTopicConfig[sub] ?? { govtMandated: 0, minPerYear: 0 }
                const bg  = SUBTOPIC_BG[sub] ?? '#f6f6f6'
                return (
                  <div key={sub} className="bg-[#f6f6f6] rounded-[14px] p-3 flex flex-col gap-2" style={{ border: `0.75px solid ${bg}` }}>
                    <p className="text-[13px] font-medium text-[#0a0a0a] leading-[1.3]">{sub}</p>
                    <div className="flex gap-1.5">
                      {([
                        { field: 'govtMandated' as const, label: 'Govt Mandated\nMin Points' },
                        { field: 'minPerYear'    as const, label: `Min Points\n${PERIOD_SUFFIX[period]}` },
                      ] as const).map(({ field, label }) => (
                        <div key={field} className="group bg-white rounded-[6px] flex-1 h-[76px] flex flex-col items-center justify-center gap-1 border border-transparent hover:border-[#d0d0d0] focus-within:border-[#1182e3] transition-colors cursor-text">
                          <input
                            type="number"
                            min="0"
                            value={scaledValue(cfg[field], period)}
                            onChange={e => updateSubTopicConfig(sub, field, Math.max(0, (parseInt(e.target.value) || 0) * PERIOD_DIVISOR[period]))}
                            placeholder="0"
                            className="w-full text-center text-[26px] font-semibold text-[#1182e3] bg-transparent outline-none tracking-[-0.5px] leading-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <p className="text-[9px] text-[#2b2b2b] text-center leading-[12px] whitespace-pre-line">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[rgba(17,130,227,0.1)] border border-[#1182e3] rounded-[6px] h-[52px] flex items-center justify-between px-3">
                      <p className="text-[11px] font-medium text-[#0a0a0a] leading-[1.3]">Minimum Points<br/>Per Year</p>
                      <p className="text-[26px] font-semibold text-[#1182e3] tracking-[-0.5px]">{cfg.minPerYear}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">Members</h2>
            </div>

            <div className="border border-[#e2e2e2] rounded-[10px] overflow-hidden">
              <table className="border-collapse text-[11px] w-full table-fixed">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                    {[
                      { key: 'name',  label: 'Name',  align: 'left',   w: '13%' },
                      { key: 'email', label: 'Email', align: 'left',   w: '14%' },
                    ].map(col => (
                      <th key={col.key} style={{ width: col.w }} className="h-[52px] px-2 font-medium text-[#404040]">
                        <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-[#1182e3] transition-colors">
                          {col.label}
                          <SortIcon active={sortKey === col.key} dir={sortDir} />
                        </button>
                      </th>
                    ))}
                    {CPD_KNOWLEDGE_AREAS.map(t => (
                      <th key={t.area} style={{ width: '10%' }} className="h-[52px] px-1 font-medium text-[#404040] leading-[13px]">
                        <button onClick={() => toggleSort(t.area)} className="flex flex-col items-center w-full hover:text-[#1182e3] transition-colors">
                          {CPD_TOPICS.find(ct => ct.area === t.area)?.header.map((line, i) => <span key={i} className="block">{line}</span>)}
                          <SortIcon active={sortKey === t.area} dir={sortDir} />
                        </button>
                      </th>
                    ))}
                    <th style={{ width: '6%' }} className="h-[52px] px-1 font-medium text-[#404040]">
                      <button onClick={() => toggleSort('total')} className="flex items-center justify-center gap-1 w-full hover:text-[#1182e3] transition-colors">
                        Total
                        <SortIcon active={sortKey === 'total'} dir={sortDir} />
                      </button>
                    </th>
                    <th style={{ width: '5%' }} className="h-[52px] px-1 text-center font-medium text-[#404040]">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((m, i) => {
                    const globalIdx = sortedMembers.indexOf(m)
                    const pts = allPoints[m.name] ?? {}
                    return (
                      <tr key={m.name} className={i < pageItems.length - 1 ? 'border-b border-[#e5e5e5]' : ''}>
                        <td className="h-[44px] px-2 text-[#404040] truncate">{m.name}</td>
                        <td className="h-[44px] px-2 text-[#404040] truncate">{m.email}</td>
                        {CPD_KNOWLEDGE_AREAS.map(t => (
                          <td key={t.area} className="h-[44px] px-1 text-center text-[#404040]">
                            {kaTopicTotal(pts, t) || '—'}
                          </td>
                        ))}
                        <td className="h-[44px] px-1 text-center font-medium text-[#404040]">
                          {kaGrandTotal(pts) || '—'}
                        </td>
                        <td className="h-[44px] px-1 text-center">
                          <button
                            onClick={() => navigate(`/cpd-plan/edit/${globalIdx}`)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors text-[#9ca3af] hover:text-[#404040]"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-[12px] text-[#737373]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedMembers.length)} of {sortedMembers.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-3 text-[12px] border border-[#e2e2e2] rounded-[6px] disabled:opacity-40 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 text-[12px] rounded-[6px] border transition-colors ${page === p ? 'border-[#1182e3] text-[#1182e3] font-medium' : 'border-[#e2e2e2] hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-3 text-[12px] border border-[#e2e2e2] rounded-[6px] disabled:opacity-40 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    Next
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
