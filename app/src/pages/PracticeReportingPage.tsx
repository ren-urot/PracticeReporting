import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'

const students = [
  { name: 'Albert Thomas', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: 'albert-thomas' },
  { name: 'Jonathan Smith', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Christine Marks', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Jonah Rocks', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Sarah Marks', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Marky Jacks', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Anthony Carr', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Mark Smith', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Jesse Jackson', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
  { name: 'Susan Mann', ar: '123456789', ethics: 4.50, client: 3.25, technical: 4.75, regulatory: 1.25, general: 1.50, tax: 3.25, total: 15.25, id: '' },
]

type SortKey = 'name'

const ViewDetailsIcon = () => (
  <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="11.5" cy="14.5" r="2.5" />
    <line x1="13.5" y1="16.5" x2="16" y2="19" />
  </svg>
)

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none" className="shrink-0 ml-1">
      <path d="M5 1L5 13M5 1L2 4M5 1L8 4" stroke={active && dir === 'asc' ? '#1182e3' : '#c0c0c0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13L2 10M5 13L8 10" stroke={active && dir === 'desc' ? '#1182e3' : '#c0c0c0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function downloadCSV() {
  const headers = ['Name', 'AR Number', 'Professionals & Ethics', 'Client Care & Practice', 'Technical Competence', 'Regulatory & Consumer Protection', 'General', 'Tax Advice', 'Total']
  const rows = students.map(s => [s.name, s.ar, s.ethics.toFixed(2), s.client.toFixed(2), s.technical.toFixed(2), s.regulatory.toFixed(2), s.general.toFixed(2), s.tax.toFixed(2), s.total.toFixed(2)])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const a = document.createElement('a')
  a.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
  a.setAttribute('download', 'practice-reporting.csv')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function PracticeReportingPage() {
  const [activePage, setActivePage] = useState(1)
  const [sortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const PAGE_SIZE = 8

  function toggleSort(_key: SortKey) {
    setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    setActivePage(1)
  }

  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageItems  = sorted.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  const cols: { key: string; lines: string[]; align?: string; w: string }[] = [
    { key: 'name',       lines: ['Name'],                              align: 'left',   w: '14%' },
    { key: 'ar',         lines: ['AR Number'],                         align: 'center', w: '11%' },
    { key: 'ethics',     lines: ['Professionals', '& Ethics'],         align: 'center', w: '10%' },
    { key: 'client',     lines: ['Client Care', '& Practice'],         align: 'center', w: '10%' },
    { key: 'technical',  lines: ['Technical', 'Competence'],           align: 'center', w: '10%' },
    { key: 'regulatory', lines: ['Regulatory', '& Consumer', 'Protection'], align: 'center', w: '13%' },
    { key: 'general',    lines: ['General'],                           align: 'center', w: '8%'  },
    { key: 'tax',        lines: ['Tax', 'Advice'],                     align: 'center', w: '8%'  },
    { key: 'total',      lines: ['Total'],                             align: 'center', w: '8%'  },
  ]

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Practice Reporting' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[18px] font-semibold text-[#0a0a0a]">Practice Reporting</h1>
              <div className="flex items-center gap-3 cursor-pointer" onClick={downloadCSV}>
                <span className="text-[14px] font-bold text-[#0a0a0a]">Download CSV</span>
                <Button variant="blue" size="icon-round" onClick={downloadCSV}>
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Gray inner section */}
            <div className="bg-[#fafafa] rounded-[14px] pt-6 pb-5">
              <div className="px-4">
                <div className="border border-[#e2e2e2] rounded-[10px] bg-white overflow-hidden">
                  <table className="w-full border-collapse text-[12px] table-fixed">
                    <thead>
                      <tr className="border-b border-[#e5e5e5]">
                        {cols.map(col => (
                          <th key={col.key} style={{ width: col.w }} className="h-[56px] px-2 font-medium text-[#404040]">
                            {col.key === 'name' ? (
                              <button
                                onClick={() => toggleSort('name')}
                                className="inline-flex items-center gap-0.5 pl-[7px] hover:text-[#1182e3] transition-colors"
                              >
                                <span className="leading-tight">{col.lines[0]}</span>
                                <SortIcon active={sortKey === 'name'} dir={sortDir} />
                              </button>
                            ) : (
                              <div className="flex flex-col items-center leading-tight text-center">
                                {col.lines.map((line, i) => <span key={i}>{line}</span>)}
                              </div>
                            )}
                          </th>
                        ))}
                        <th style={{ width: '8%' }} className="h-[56px] px-2 text-center font-medium text-[#404040] leading-tight">
                          View<br />Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((s) => (
                        <tr key={s.name} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="h-[46px] px-[15px] truncate">{s.name}</td>
                          <td className="h-[46px] px-2 text-center">{s.ar}</td>
                          <td className="h-[46px] px-2 text-center">{s.ethics.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">{s.client.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">{s.technical.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">{s.regulatory.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">{s.general.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">{s.tax.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center font-medium">{s.total.toFixed(2)}</td>
                          <td className="h-[46px] px-2 text-center">
                            {s.id ? (
                              <Link to={`/student/${s.id}`} className="inline-flex items-center justify-center w-5 h-5 hover:text-[#1182e3] transition-colors">
                                <ViewDetailsIcon />
                              </Link>
                            ) : (
                              <a href="#" className="inline-flex items-center justify-center w-5 h-5 hover:text-[#1182e3] transition-colors">
                                <ViewDetailsIcon />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-[14px] text-[#737373]">
                Showing {(activePage - 1) * PAGE_SIZE + 1} to {Math.min(activePage * PAGE_SIZE, sorted.length)} of {sorted.length} entries
              </span>
              {totalPages > 1 && (
                <nav className="flex items-center gap-1">
                  <Button variant="outline" size="pagination-btn" onClick={() => setActivePage(p => Math.max(1, p - 1))} disabled={activePage === 1}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Button
                      key={p}
                      variant={activePage === p ? 'outline' : 'ghost'}
                      size="pagination"
                      onClick={() => setActivePage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="pagination-btn" onClick={() => setActivePage(p => Math.min(totalPages, p + 1))} disabled={activePage === totalPages}>
                    Next
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Button>
                </nav>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
