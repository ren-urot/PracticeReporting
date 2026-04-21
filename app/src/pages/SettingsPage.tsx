import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'

const FileUpIcon = () => (
  <svg width="22" height="22" fill="none" stroke="#1182e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 12v6" />
    <path d="m15 15-3-3-3 3" />
  </svg>
)

const OPTION_CARDS = [
  { id: 'manual', route: '/manual-upload', title: 'Manual Input, Names and Emails',  description: 'Use this option when presenting to a new small group.' },
  { id: 'bulk',   route: '/bulk-upload',   title: 'Bulk Upload, Names and Emails',   description: 'Use this option when presenting to a new large group.' },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">
            <h1 className="text-[18px] font-semibold text-[#0a0a0a] mb-6">Add People</h1>

            <div className="flex flex-col gap-3">
              {OPTION_CARDS.map(card => (
                <button
                  key={card.id}
                  onClick={() => navigate(card.route)}
                  className="flex items-center gap-6 px-6 py-[14px] rounded-[6px] border border-[#e5e5e5] text-left w-full hover:border-[#1182e3]/50 transition-colors"
                >
                  <div className="flex items-center justify-center shrink-0 size-[45px] rounded-[8px] border border-[#e5e5e5]">
                    <FileUpIcon />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[16px] font-medium text-[#203649] leading-7">{card.title}</span>
                    <span className="text-[11px] font-light text-[#203649] leading-[14px]">{card.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
