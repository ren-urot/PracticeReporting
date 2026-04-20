import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'

const ROLES = ['Provider', 'Admin', 'Manager', 'Advisor']

export default function AccountPage() {
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('Jack')
  const [lastName, setLastName] = useState('Black')
  const [role, setRole] = useState('')
  const [email] = useState('jackblack@gmail.com')

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Account' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">
            <h1 className="text-[18px] font-semibold text-[#0a0a0a] mb-6">Personal Information</h1>

            {/* Avatar + upload */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-[60px] h-[60px] rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0">
                <span className="text-[18px] font-semibold text-[#6b7280]">{initials}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#404040] hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload
              </button>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8">
              {/* First name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#0a0a0a]">First name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={!editing}
                  className="h-[46px] px-4 rounded-[8px] border border-[#e5e5e5] text-[14px] text-[#404040] bg-[#f5f5f5] disabled:cursor-default focus:outline-none focus:border-[#1182e3] enabled:bg-white transition-colors"
                  placeholder="First name"
                />
              </div>

              {/* Last name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#0a0a0a]">Last name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={!editing}
                  className="h-[46px] px-4 rounded-[8px] border border-[#e5e5e5] text-[14px] text-[#404040] bg-[#f5f5f5] disabled:cursor-default focus:outline-none focus:border-[#1182e3] enabled:bg-white transition-colors"
                  placeholder="Last name"
                />
              </div>

              {/* Select Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#0a0a0a]">Select Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    disabled={!editing}
                    className="w-full h-[46px] px-4 pr-10 rounded-[8px] border border-[#e5e5e5] text-[14px] text-[#a1a1a1] bg-[#f5f5f5] disabled:cursor-default focus:outline-none focus:border-[#1182e3] enabled:bg-white transition-colors appearance-none"
                  >
                    <option value="" disabled>Select Role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#0a0a0a]">Email</label>
                <input
                  value={email}
                  disabled
                  className="h-[46px] px-4 rounded-[8px] border border-[#e5e5e5] text-[14px] text-[#404040] bg-[#f5f5f5] cursor-default"
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Edit / Save button */}
            <div className="flex justify-end">
              {editing ? (
                <div className="flex gap-3">
                  <Button variant="outline" size="default" className="rounded-[8px]" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="default" size="default" className="rounded-[8px]" onClick={() => setEditing(false)}>Save</Button>
                </div>
              ) : (
                <Button variant="default" size="default" className="rounded-[8px]" onClick={() => setEditing(true)}>Edit</Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
