import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'
import { loadMembers, saveMembers } from '@/lib/cpdData'

type Recipient = { id: number; name: string; email: string }

export default function ManualUploadPage() {
  const navigate = useNavigate()

  const [fullName, setFullName]     = useState('')
  const [email, setEmail]           = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [sendState, setSendState]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [alert, setAlert]           = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function addRecipient() {
    if (!fullName.trim() || !email.trim()) return
    setRecipients(prev => [...prev, { id: Date.now(), name: fullName.trim(), email: email.trim() }])
    setFullName('')
    setEmail('')
  }

  function removeRecipient(id: number) {
    setRecipients(prev => prev.filter(r => r.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addRecipient()
  }

  function handleSendTest() {
    if (recipients.length === 0 || sendState !== 'idle') return
    setSendState('sending')
    setAlert(null)
    setTimeout(() => {
      try {
        const existing = loadMembers()
        const newMembers = recipients
          .filter(r => !existing.some(m => m.email === r.email))
          .map(r => ({ name: r.name, email: r.email }))
        saveMembers([...existing, ...newMembers])
        setSendState('sent')
        setAlert({ type: 'success', message: `${newMembers.length} member${newMembers.length !== 1 ? 's' : ''} added successfully!` })
        setRecipients([])
      } catch {
        setSendState('error')
        setAlert({ type: 'error', message: 'Failed to add members. Please try again.' })
      }
      setTimeout(() => { setSendState('idle'); setAlert(null) }, 4000)
    }, 800)
  }

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings', href: '/settings' }, { label: 'Manual Upload' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">

            {/* Back + heading */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-[#404040]"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h1 className="text-[18px] font-semibold text-[#0a0a0a]">Manual Upload</h1>
            </div>

            {/* Gray inner section */}
            <div className="bg-[#fafafa] rounded-[14px] p-6">

              {/* Input row */}
              <div className="flex items-end gap-4 mb-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#404040]">Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Full Name on Certificate"
                    className="h-[35px] w-[235px] px-[9px] border border-[#cacaca] rounded-[4px] text-[14px] text-[#404040] placeholder:text-[#9c9898] focus:outline-none focus:border-[#1182e3] bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#404040]">Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Email here"
                    className="h-[35px] w-[235px] px-[9px] border border-[#cacaca] rounded-[4px] text-[14px] text-[#404040] placeholder:text-[#9c9898] focus:outline-none focus:border-[#1182e3] bg-white"
                  />
                </div>
                <Button variant="default" size="default" className="h-[35px] rounded-[8px]" onClick={addRecipient}>Add</Button>
              </div>

              {/* Invited Recipients */}
              <div className="mb-2">
                <p className="text-[14px] font-medium text-[#404040] mb-2">Invited Recipients</p>
                <div className="bg-white border border-[#cacaca] rounded-[4px] min-h-[86px] p-3 flex flex-wrap gap-2 content-start">
                  {recipients.map(r => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 bg-[rgba(17,130,227,0.2)] text-[#1182e3] text-[12px] rounded-[30px] pl-[7px] pr-1 h-[25px] whitespace-nowrap"
                    >
                      {r.name} &lt;{r.email}&gt;
                      <button
                        onClick={() => removeRecipient(r.id)}
                        className="flex items-center justify-center w-[18px] h-[18px] rounded-full hover:bg-[rgba(17,130,227,0.3)] transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#1182e3" strokeWidth="1.8" strokeLinecap="round">
                          <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {/* Alert */}
              {alert && (
                <div className={`flex items-center gap-2 mt-3 px-4 py-3 rounded-[8px] text-[13px] font-medium ${
                  alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {alert.type === 'success' ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  {alert.message}
                </div>
              )}

              {/* Send button */}
              <div className="flex items-center justify-end mt-3">
                <Button
                  variant="default"
                  size="default"
                  className={`rounded-[8px] min-w-[148px] transition-colors ${sendState === 'sent' ? 'bg-green-600 hover:bg-green-600' : sendState === 'error' ? 'bg-red-600 hover:bg-red-600' : ''}`}
                  disabled={recipients.length === 0 || (sendState !== 'idle' && sendState !== 'error')}
                  onClick={handleSendTest}
                >
                  {sendState === 'sending' && (
                    <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {sendState === 'sent' && (
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                  {sendState === 'idle' || sendState === 'error' ? 'Send' : sendState === 'sending' ? 'Sending…' : 'Sent!'}
                </Button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
