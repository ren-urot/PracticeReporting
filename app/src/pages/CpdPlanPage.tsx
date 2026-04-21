import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'

import {
  CPD_TOPICS,
  loadAllPoints, topicTotal, grandTotal,
  loadMembers,
  REQUIRED_QUARTERLY_POINTS, REQUIRED_HALFYEARLY_POINTS, REQUIRED_YEARLY_POINTS,
  type AllPoints, type Member,
} from '@/lib/cpdData'

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
  const [allPoints, setAllPoints]     = useState<AllPoints>(() => loadAllPoints())

  const [sortKey, setSortKey]   = useState<string>('name')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 8

  useEffect(() => {
    setMembers(loadMembers())
    setAllPoints(loadAllPoints())
  }, [])

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const ptsA = allPoints[a.name] ?? {}
      const ptsB = allPoints[b.name] ?? {}
      let va: string | number
      let vb: string | number
      if (sortKey === 'name')  { va = a.name;  vb = b.name }
      else if (sortKey === 'email') { va = a.email; vb = b.email }
      else if (sortKey === 'total') { va = grandTotal(ptsA); vb = grandTotal(ptsB) }
      else {
        const topic = CPD_TOPICS.find(t => t.area === sortKey)
        va = topic ? topicTotal(ptsA, topic) : 0
        vb = topic ? topicTotal(ptsB, topic) : 0
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

            {/* Accumulation cards */}
            <div className="flex gap-[11px]">
              {[
                { label: 'Quarterly', sublabel: 'Points needed every 3 months', value: quarterly },
                { label: '6 Months',  sublabel: 'Points needed every 6 months',  value: half      },
                { label: 'Yearly',    sublabel: 'Total points needed per year',   value: yearly    },
              ].map((card) => (
                <div key={card.label} className="bg-[#f6f6f6] rounded-[14px] flex-1 h-[170px] px-[23px] pt-[19px] pb-[18px] flex flex-col justify-between items-center text-center">
                  <p className="text-[16px] font-bold text-[#0a0a0a]">{card.label}</p>
                  <div className="flex items-end gap-[6px]">
                    <span className="text-[67px] font-semibold text-[#1182e3] leading-none">{card.value}</span>
                    <span className="text-[21px] font-medium text-[#565656] mb-2">pts</span>
                  </div>
                  <p className="text-[12px] text-[#818181] font-normal">{card.sublabel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CPD Plan */}
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
                    {CPD_TOPICS.map(t => (
                      <th key={t.area} style={{ width: '10%' }} className="h-[52px] px-1 font-medium text-[#404040] leading-[13px]">
                        <button onClick={() => toggleSort(t.area)} className="flex flex-col items-center w-full hover:text-[#1182e3] transition-colors">
                          {t.header.map((line, i) => <span key={i} className="block">{line}</span>)}
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
                        {CPD_TOPICS.map(t => (
                          <td key={t.area} className="h-[44px] px-1 text-center text-[#404040]">
                            {topicTotal(pts, t) || '—'}
                          </td>
                        ))}
                        <td className="h-[44px] px-1 text-center font-medium text-[#404040]">
                          {grandTotal(pts) || '—'}
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
