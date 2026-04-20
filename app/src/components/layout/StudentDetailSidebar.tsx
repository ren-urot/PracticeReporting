import { Link } from 'react-router-dom'

export default function StudentDetailSidebar() {
  return (
    <aside className="sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto w-[280px] shrink-0 bg-[#f5f5f5] flex flex-col gap-2.5 p-3">
      {/* Profile + Account card */}
      <div className="bg-white rounded-[12px] border border-[#e2e2e2] px-4 py-3">
        <div className="flex items-center gap-3 py-1">
          <div className="bg-[#1a2744] rounded-full w-11 h-11 flex items-center justify-center shrink-0">
            <span className="text-white text-[14px] font-semibold">JB</span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#1a2744] leading-5 truncate">Jack Black</p>
            <p className="text-[12px] font-light text-[#404040] leading-4 truncate">Provider User ID#12345</p>
          </div>
        </div>
        <div className="h-px bg-[#dbdbdb] mt-3 -mx-4" />
        <div className="mt-2">
          <p className="text-[12px] font-medium text-[#9ca3af] px-2 py-2 uppercase tracking-wider">Profile</p>
          <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-gray-50 transition-colors">
            <svg width="17" height="17" fill="none" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-[14px] text-[#1a2744]">Account Settings</span>
          </Link>
          <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-gray-50 transition-colors">
            <svg width="17" height="17" fill="none" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 16l4-4-4-4M21 12H9M13 5v-1a3 3 0 00-3-3H6a3 3 0 00-3 3v14a3 3 0 003 3h4a3 3 0 003-3v-1" />
            </svg>
            <span className="text-[14px] text-[#1a2744]">Sign Out</span>
          </Link>
        </div>
      </div>

      {/* Dashboard (active) */}
      <div className="bg-white rounded-[12px] border border-[#e2e2e2] px-3 py-1.5">
        <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-[8px]">
          <svg width="17" height="17" fill="none" stroke="#1182e3" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[14px] font-semibold text-[#1182e3]">Dashboard</span>
        </Link>
      </div>

      {/* CPD Library */}
      <div className="bg-white rounded-[12px] border border-[#e2e2e2] px-3 py-1.5">
        <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-gray-50 transition-colors">
          <svg width="17" height="17" fill="none" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="text-[14px] text-[#1a2744]">CPD Library</span>
        </Link>
      </div>
    </aside>
  )
}
