import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function PracticeReportingSidebar() {
  const { pathname } = useLocation()

  const isAccount = pathname === '/account'
  const isReporting = pathname === '/practice-reporting'
  const isAddPeople = ['/settings', '/manual-upload', '/bulk-upload'].includes(pathname)
  const isCpd = pathname === '/cpd-plan' || pathname.startsWith('/cpd-plan/')
  const isSettingsSection = isAddPeople || isCpd
  const isPracticeReportingSection = isReporting || isSettingsSection

  const [expanded, setExpanded] = useState(isPracticeReportingSection)
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsSection)

  return (
    <aside className="sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto w-[280px] shrink-0 bg-[#f5f5f5] flex flex-col gap-2.5 p-3">
      {/* User profile card */}
      <div className="bg-white rounded-[10px] px-3 py-1.5">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <div className="w-8 h-8 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden">
            <svg width="18" height="18" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-semibold text-[#404040] leading-7 truncate">Jack Black</span>
            <span className="text-[12px] font-light text-[#404040] leading-4 truncate">Provider User ID#12345</span>
          </div>
        </div>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-[10px] p-2">
        <div className="px-2 h-8 flex items-center opacity-70">
          <span className="text-[12px] font-medium text-[#404040] uppercase tracking-wider">Profile</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <Link to="/account" className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${isAccount ? '' : 'hover:bg-gray-50'}`}>
            <svg width="16" height="16" fill="none" stroke={isAccount ? '#1182e3' : '#404040'} strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className={`text-[14px] ${isAccount ? 'font-semibold text-[#1182e3]' : 'text-[#404040]'}`}>Account</span>
          </Link>
          <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" fill="none" stroke="#404040" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4-4-4M21 12H9M13 5v-1a3 3 0 00-3-3H6a3 3 0 00-3 3v14a3 3 0 003 3h4a3 3 0 003-3v-1" />
            </svg>
            <span className="text-[14px] text-[#404040]">Sign Out</span>
          </Link>
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-white rounded-[10px] p-2">
        <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" fill="none" stroke="#404040" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[14px] text-[#404040]">Dashboard</span>
        </Link>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-[10px] p-2">
        <Link to="#" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" fill="none" stroke="#404040" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3-3 3M12 10v12" />
          </svg>
          <span className="text-[14px] text-[#404040]">Upload</span>
        </Link>
      </div>

      {/* Practice Reporting group */}
      <div className="bg-white rounded-[10px] p-2">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 px-2 py-2 w-full rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke={expanded ? '#1182e3' : '#404040'} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
          </svg>
          <span className={`text-[14px] flex-1 text-left ${expanded ? 'font-semibold text-[#1182e3]' : 'text-[#404040]'}`}>Practice Reporting</span>
          <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && <div className="ml-6 flex flex-col gap-0.5 mb-1">
          <Link
            to="/practice-reporting"
            className={`py-1.5 text-[13px] transition-colors ${isReporting ? 'text-[#1182e3] font-medium' : 'text-[#404040] hover:text-[#1182e3]'}`}
          >
            Reporting
          </Link>
          <button
            onClick={() => setSettingsExpanded(v => !v)}
            className={`py-1.5 text-[13px] text-left flex items-center justify-between transition-colors ${isSettingsSection ? 'text-[#1182e3] font-medium' : 'text-[#404040] hover:text-[#1182e3]'}`}
          >
            Settings
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform mr-1 ${settingsExpanded ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {settingsExpanded && <div className="ml-4 flex flex-col gap-0.5">
            <Link
              to="/settings"
              className={`py-1.5 text-[13px] transition-colors ${isAddPeople ? 'text-[#1182e3] font-medium' : 'text-[#404040] hover:text-[#1182e3]'}`}
            >
              Add People
            </Link>
            <Link
              to="/cpd-plan"
              className={`py-1.5 text-[13px] transition-colors ${isCpd ? 'text-[#1182e3] font-medium' : 'text-[#404040] hover:text-[#1182e3]'}`}
            >
              CPD Plan
            </Link>
          </div>}
        </div>}
      </div>
    </aside>
  )
}
