import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'

const students = [
  { name: 'Albert Thomas', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: 'albert-thomas' },
  { name: 'Jonathan Smith', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Christine Marks', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Jonah Rocks', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Sarah Marks', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Marky Jacks', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Anthony Carr', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Mark Smith', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Jesse Jackson', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
  { name: 'Susan Mann', ar: '123456789', ethics: '4.50', client: '3.25', technical: '4.75', regulatory: '1.25', general: '1.50', tax: '3.25', total: '15.25', id: '' },
]

const ViewDetailsIcon = () => (
  <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="11.5" cy="14.5" r="2.5" />
    <line x1="13.5" y1="16.5" x2="16" y2="19" />
  </svg>
)

export default function PracticeReportingPage() {
  const [activePage, setActivePage] = useState(3)

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
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-bold text-[#0a0a0a]">Download CSV</span>
                <Button variant="blue" size="icon-round">
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Gray inner section */}
            <div className="bg-[#fafafa] rounded-[14px] pt-6 pb-5">

              {/* Table */}
              <div className="px-4">
                <div className="border border-[#e2e2e2] rounded-[10px] bg-white overflow-hidden">
                  <table className="w-full border-collapse text-[12px] table-fixed">
                    <thead>
                      <tr className="border-b border-[#e5e5e5]">
                        <th className="h-[56px] px-[15px] text-left w-[14%]">Name</th>
                        <th className="h-[56px] px-2 text-center w-[11%]">AR Number</th>
                        <th className="h-[56px] px-2 text-center w-[10%] leading-tight">Professionals<br />&amp; Ethics</th>
                        <th className="h-[56px] px-2 text-center w-[10%] leading-tight">Client Care<br />&amp; Practice</th>
                        <th className="h-[56px] px-2 text-center w-[10%] leading-tight">Technical<br />Competence</th>
                        <th className="h-[56px] px-2 text-center w-[13%] leading-tight">Regulatory<br />&amp; Consumer<br />Protection</th>
                        <th className="h-[56px] px-2 text-center w-[8%]">General</th>
                        <th className="h-[56px] px-2 text-center w-[8%]">Tax<br />Advice</th>
                        <th className="h-[56px] px-2 text-center w-[8%]">Total</th>
                        <th className="h-[56px] px-2 text-center w-[8%] leading-tight">View<br />Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.name} className={`${i < students.length - 1 ? 'border-b border-[#e5e5e5]' : ''} hover:bg-gray-50 transition-colors`}>
                          <td className="h-[46px] px-[15px] whitespace-nowrap">{s.name}</td>
                          <td className="h-[46px] px-2 text-center">{s.ar}</td>
                          <td className="h-[46px] px-2 text-center">{s.ethics}</td>
                          <td className="h-[46px] px-2 text-center">{s.client}</td>
                          <td className="h-[46px] px-2 text-center">{s.technical}</td>
                          <td className="h-[46px] px-2 text-center">{s.regulatory}</td>
                          <td className="h-[46px] px-2 text-center">{s.general}</td>
                          <td className="h-[46px] px-2 text-center">{s.tax}</td>
                          <td className="h-[46px] px-2 text-center font-medium">{s.total}</td>
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
              <span className="text-[14px] text-[#737373]">Showing 1 to 10 of 20 entries</span>
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="pagination-btn">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Previous
                </Button>
                {[1, 2, 3].map((p) => (
                  <Button
                    key={p}
                    variant={activePage === p ? 'outline' : 'ghost'}
                    size="pagination"
                    onClick={() => setActivePage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button variant="ghost" size="pagination">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                  </svg>
                </Button>
                <Button variant="outline" size="pagination-btn">
                  Next
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Button>
              </nav>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
