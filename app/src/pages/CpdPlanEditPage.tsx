import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'
import {
  CPD_KNOWLEDGE_AREAS,
  loadAllKAPoints, saveAllKAPoints, loadMembers,
  type MemberPoints,
} from '@/lib/cpdData'

export default function CpdPlanEditPage() {
  const navigate = useNavigate()
  const { memberIndex } = useParams<{ memberIndex: string }>()
  const idx    = parseInt(memberIndex ?? '0')
  const member = loadMembers()[idx]

  const [points, setPoints] = useState<MemberPoints>(() => {
    const all = loadAllKAPoints()
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
    const all = loadAllKAPoints()
    all[member.name] = points
    saveAllKAPoints(all)
    navigate('/cpd-plan')
  }

  function handleExit() {
    navigate('/cpd-plan')
  }

  function kaTopicTotal(subs: string[]) {
    return subs.reduce((sum, s) => sum + (points[s] || 0), 0)
  }

  const allocated = CPD_KNOWLEDGE_AREAS.reduce((sum, t) => sum + kaTopicTotal(t.subs), 0)

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

            {/* Table */}
            <div className="border border-[#e2e2e2] rounded-[10px] overflow-hidden">
              <table className="w-full border-collapse text-[13px] table-fixed">
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                    <th className="h-[48px] px-4 text-left font-medium text-[#404040]">Main Topic</th>
                    <th className="h-[48px] px-4 text-left font-medium text-[#404040]">Sub-topic</th>
                    <th className="h-[48px] px-4 text-center font-medium text-[#404040]">Points / Year</th>
                  </tr>
                </thead>
                <tbody>
                  {CPD_KNOWLEDGE_AREAS.map((topic, ti) => {
                    const isLastTopic = ti === CPD_KNOWLEDGE_AREAS.length - 1
                    return (
                      <>
                        {/* Main topic row */}
                        <tr key={`area-${topic.area}`} className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <td colSpan={2} className="h-[48px] px-4">
                            <span className="font-semibold text-[#0a0a0a]">{topic.area}</span>
                          </td>
                          <td className="h-[48px] px-4 text-center">
                            <div className="w-20 mx-auto h-8 flex items-center justify-center border-2 border-[#1182e3] rounded-[6px] bg-white text-[13px] font-bold text-[#1182e3]">
                              {kaTopicTotal(topic.subs)}
                            </div>
                          </td>
                        </tr>
                        {/* Sub-topic rows */}
                        {topic.subs.map((sub, si) => {
                          const isLastSub = isLastTopic && si === topic.subs.length - 1
                          const isGroupEnd = si === topic.subs.length - 1
                          return (
                            <tr key={sub} className={isLastSub ? '' : isGroupEnd ? 'border-b-2 border-[#e2e2e2]' : 'border-b border-[#e5e5e5]'}>
                              <td className="h-[46px] px-4" />
                              <td className="h-[46px] px-4 text-[#1182e3]">{sub}</td>
                              <td className="h-[46px] px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={points[sub] || ''}
                                  onChange={e => setPoint(sub, e.target.value)}
                                  placeholder="0"
                                  className="w-20 text-center border border-[#e2e2e2] rounded-[6px] h-8 text-[12px] px-2 focus:outline-none focus:border-[#1182e3] bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </>
                    )
                  })}
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
