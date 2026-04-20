import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CPD_AREAS = [
  { category: 'Professionalism & Ethics', areas: [
    'Ethics & Professional Standards',
    'Conflicts of Interest',
    'Professional Conduct',
  ]},
  { category: 'Client Care & Practice', areas: [
    'Client Engagement',
    'Communication Skills',
    'Complaints Handling',
    'Client Needs Analysis',
  ]},
  { category: 'Technical Competence', areas: [
    'Investment Planning',
    'Financial Planning',
    'Risk Management',
    'Superannuation',
  ]},
  { category: 'Regulatory & Consumer Protection', areas: [
    'Regulatory Compliance',
    'Consumer Protection Law',
    'Privacy & Data',
    'Anti-Money Laundering',
  ]},
  { category: 'General', areas: [
    'General Professional Development',
    'Leadership & Management',
    'Business Skills',
  ]},
  { category: 'Tax Advice', areas: [
    'Tax Planning',
    'Tax Compliance',
    'Tax Law Updates',
    'International Tax',
  ]},
]

const ALL_AREAS = CPD_AREAS.flatMap(c => c.areas.map(a => ({ category: c.category, area: a })))

const PERIOD_OPTIONS = [
  { value: '3', label: 'Every 3 months' },
  { value: '6', label: 'Every 6 months' },
  { value: '12', label: 'Every 12 months' },
]

type CpdRow = { points: string; period: string }

function initCpdRows(): Record<string, CpdRow> {
  const rows: Record<string, CpdRow> = {}
  ALL_AREAS.forEach(({ area }) => { rows[area] = { points: '', period: '12' } })
  return rows
}

export default function CpdPlanPage() {
  const [refreshDate, setRefreshDate] = useState('')
  const [cpdRows, setCpdRows] = useState<Record<string, CpdRow>>(initCpdRows)

  function updateRow(area: string, field: keyof CpdRow, value: string) {
    setCpdRows(prev => ({ ...prev, [area]: { ...prev[area], [field]: value } }))
  }

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings', href: '/settings' }, { label: 'CPD Plan' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4 flex flex-col gap-4">

          {/* Annual Refresh Date */}
          <div id="annual-refresh" className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] mb-4">Annual Refresh</h2>
            <div className="bg-[#fafafa] rounded-[14px] p-6">
              <div className="flex flex-col gap-1 max-w-[260px]">
                <Label htmlFor="refreshdate">Refresh Date</Label>
                <Input
                  id="refreshdate"
                  type="date"
                  value={refreshDate}
                  onChange={e => setRefreshDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <p className="text-[12px] text-[#9ca3af] mt-2">CPD points reset annually on this date.</p>
            </div>
          </div>

          {/* CPD Plan */}
          <div id="cpd-plan" className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-[#0a0a0a]">CPD Plan</h2>
              <Button variant="blue" size="default" className="rounded-[8px]">Save Plan</Button>
            </div>
            <div className="bg-[#fafafa] rounded-[14px] p-4">
              <div className="border border-[#e2e2e2] rounded-[10px] bg-white overflow-hidden">
                <table className="w-full border-collapse text-[12px] table-fixed">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="h-[48px] px-4 text-left w-[35%] font-medium text-[#404040]">Area</th>
                      <th className="h-[48px] px-4 text-left w-[25%] font-medium text-[#404040]">Category</th>
                      <th className="h-[48px] px-4 text-center w-[15%] font-medium text-[#404040]">Points</th>
                      <th className="h-[48px] px-4 text-center w-[25%] font-medium text-[#404040]">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_AREAS.map(({ category, area }, i) => (
                      <tr key={area} className={i < ALL_AREAS.length - 1 ? 'border-b border-[#e5e5e5]' : ''}>
                        <td className="h-[46px] px-4 text-[#0a0a0a]">{area}</td>
                        <td className="h-[46px] px-4 text-[#737373]">{category}</td>
                        <td className="h-[46px] px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            value={cpdRows[area].points}
                            onChange={e => updateRow(area, 'points', e.target.value)}
                            placeholder="0"
                            className="w-16 text-center border border-[#e2e2e2] rounded-[6px] h-8 text-[12px] px-2 focus:outline-none focus:border-[#1182e3] bg-white"
                          />
                        </td>
                        <td className="h-[46px] px-4 text-center">
                          <select
                            value={cpdRows[area].period}
                            onChange={e => updateRow(area, 'period', e.target.value)}
                            className="border border-[#e2e2e2] rounded-[6px] h-8 text-[12px] px-2 focus:outline-none focus:border-[#1182e3] bg-white text-[#404040] cursor-pointer"
                          >
                            {PERIOD_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
