import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'
import {
  CPD_TOPICS,
  loadAllPoints, saveAllPoints, loadMembers,
  grandTotal,
  type MemberPoints,
} from '@/lib/cpdData'

export default function CpdPlanEditPage() {
  const navigate = useNavigate()
  const { memberIndex } = useParams<{ memberIndex: string }>()
  const idx    = parseInt(memberIndex ?? '0')
  const member = loadMembers()[idx]

  const [points, setPoints] = useState<MemberPoints>(() => {
    const all = loadAllPoints()
    return { ...all[member?.name ?? ''] }
  })

  useEffect(() => {
    if (!member) navigate('/cpd-plan')
  }, [member, navigate])

  if (!member) return null

  function setPoint(sub: string, val: string) {
    const n = Math.max(0, parseInt(val) || 0)
    setPoints(prev => ({ ...prev, [sub]: n }))
  }

  function handleSave() {
    const all = loadAllPoints()
    all[member.name] = points
    saveAllPoints(all)
    navigate('/cpd-plan')
  }

  function handleExit() {
    navigate('/cpd-plan')
  }

  const allocated = grandTotal(points)

  const lastSub = CPD_TOPICS[CPD_TOPICS.length - 1].subs.at(-1)

  return (
    <div>
      <Navbar breadcrumb={[
        { label: 'Dashboard', href: '#' },
        { label: 'Settings', href: '/settings' },
        { label: 'CPD Plan', href: '/cpd-plan' },
        { label: 'Edit Points' },
      ]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExit}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-[#404040]"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-[18px] font-semibold text-[#0a0a0a] leading-tight">{member.name}</h1>
                  <p className="text-[12px] text-[#737373]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="default" className="rounded-[8px]" onClick={handleExit}>
                  Exit
                </Button>
                <Button variant="default" size="default" className="rounded-[8px]" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>

            {/* Sub-topics table */}
            <div className="border border-[#e2e2e2] rounded-[10px] overflow-hidden">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                    <th className="h-[48px] px-4 text-left font-medium text-[#404040] w-[30%]">Area</th>
                    <th className="h-[48px] px-4 text-left font-medium text-[#404040] w-[50%]">Sub-topic</th>
                    <th className="h-[48px] px-4 text-center font-medium text-[#404040] w-[20%]">Points / Year</th>
                  </tr>
                </thead>
                <tbody>
                  {CPD_TOPICS.map(topic =>
                    topic.subs.map((sub, si) => {
                      const pts = points[sub] || 0
                      const isLast     = sub === lastSub
                      const isGroupEnd = si === topic.subs.length - 1
                      return (
                        <tr key={sub} className={isLast ? '' : isGroupEnd ? 'border-b-2 border-[#e2e2e2]' : 'border-b border-[#e5e5e5]'}>
                          {si === 0 && (
                            <td rowSpan={topic.subs.length} className="px-4 py-3 text-[#404040] font-medium align-top text-[12px]">
                              {topic.area}
                            </td>
                          )}
                          <td className="h-[46px] px-4 text-[#404040]">{sub}</td>
                          <td className="h-[46px] px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              value={pts || ''}
                              onChange={e => setPoint(sub, e.target.value)}
                              placeholder="0"
                              className="w-20 text-center border border-[#e2e2e2] rounded-[6px] h-8 text-[12px] px-2 focus:outline-none focus:border-[#1182e3] bg-white"
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#e2e2e2] bg-[#fafafa]">
                    <td className="h-[48px] px-4 font-semibold text-[#0a0a0a]" colSpan={2}>Total Points Allocated / Year</td>
                    <td className="h-[48px] px-4 text-center font-bold text-[#1182e3]">{allocated}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom save/exit */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" size="default" className="rounded-[8px]" onClick={handleExit}>
                Exit
              </Button>
              <Button variant="default" size="default" className="rounded-[8px]" onClick={handleSave}>
                Save
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
