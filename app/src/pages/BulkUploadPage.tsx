import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import PracticeReportingSidebar from '@/components/layout/PracticeReportingSidebar'
import { Button } from '@/components/ui/button'
import { loadMembers, saveMembers } from '@/lib/cpdData'

type Recipient = { id: number; name: string; email: string }


const PAGE_SIZE = 5

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

const UploadBoxIcon = () => (
  <div className="w-[52px] h-[52px] bg-white rounded-[10px] border border-[#e5e5e5] flex items-center justify-center mb-4 shadow-sm">
    <svg width="26" height="26" fill="none" stroke="#404040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  </div>
)

export default function BulkUploadPage() {
  const navigate = useNavigate()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [dragOver, setDragOver]     = useState(false)
  const [page, setPage]             = useState(1)
  const [sendState, setSendState]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError]           = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploaded = recipients.length > 0
  const totalPages = Math.ceil(recipients.length / PAGE_SIZE)
  const pageItems = recipients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function parseCSV(text: string): Recipient[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (!lines.length) return []

    // Detect and skip header row
    const firstLower = lines[0].toLowerCase()
    const start = (firstLower.includes('name') || firstLower.includes('email')) ? 1 : 0

    return lines.slice(start).reduce<Recipient[]>((acc, line, i) => {
      const [namePart, emailPart] = line.split(',').map(s => s.trim())
      if (namePart && emailPart) acc.push({ id: i + 1, name: namePart, email: emailPart })
      return acc
    }, [])
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (!parsed.length) {
        setError('No valid rows found. Expected columns: Name, Email.')
        return
      }
      setRecipients(parsed)
      setPage(1)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeRecipient(id: number) {
    setRecipients(prev => prev.filter(r => r.id !== id))
  }

  function handleSend() {
    if (!uploaded || sendState !== 'idle') return
    setSendState('sending')
    setTimeout(() => {
      try {
        const existing = loadMembers()
        const newMembers = recipients
          .filter(r => !existing.some(m => m.email === r.email))
          .map(r => ({ name: r.name, email: r.email }))
        saveMembers([...existing, ...newMembers])
        setSendState('sent')
        setTimeout(() => navigate('/practice-reporting'), 1500)
      } catch {
        setSendState('error')
        setTimeout(() => setSendState('idle'), 3000)
      }
    }, 1200)
  }

  const pageNumbers: (number | '…')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else {
    pageNumbers.push(1, 2, 3, '…')
  }

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard', href: '#' }, { label: 'Settings', href: '/settings' }, { label: 'Bulk Upload' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <PracticeReportingSidebar />

        <main className="flex-1 min-w-0 p-4">
          <div className="bg-white rounded-[10px] pt-[13px] pb-[29px] px-[31px]">

            {/* Back + heading */}
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-[#404040]"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h1 className="text-[18px] font-semibold text-[#0a0a0a]">Bulk Upload</h1>
            </div>

            {uploaded && (
              <div className="flex items-center justify-between mb-4 ml-11">
                <p className="text-[14px] text-[#404040]">
                  No. of Recipients: <span className="font-semibold">{recipients.length}</span>
                </p>
                <button
                  onClick={() => { setRecipients([]); setError(null) }}
                  className="text-[13px] text-[#737373] hover:text-[#404040] underline transition-colors"
                >
                  Upload different file
                </button>
              </div>
            )}

            {/* Drop zone */}
            {!uploaded && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`mt-4 rounded-[20px] h-[335px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOver ? 'bg-blue-50 border-2 border-dashed border-[#1182e3]' : 'bg-[#f4f4f4] border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.CSV"
                  className="hidden"
                  onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
                <UploadBoxIcon />
                <p className="text-[14px] font-medium text-[#404040]">Upload Files</p>
                <p className="text-[14px] font-medium text-[#404040] mt-1">Drag and drop or click to upload</p>
                <p className="text-[12px] text-[#404040] mt-0.5">CSV format, up to 10 MB.</p>
                {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
              </div>
            )}

            {/* Table */}
            {uploaded && (
              <div className="mt-4">
                <div className="border border-[#e2e2e2] rounded-[10px] overflow-hidden">
                  <table className="w-full border-collapse text-[14px] table-fixed">
                    <thead>
                      <tr className="border-b border-[#e5e5e5]">
                        <th className="h-[56px] px-6 text-left font-medium text-[#404040] w-[40%]">Name</th>
                        <th className="h-[56px] px-2 text-left font-medium text-[#404040] w-[48%]">Email</th>
                        <th className="h-[56px] px-2 text-center font-medium text-[#404040] w-[12%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((r, i) => (
                        <tr key={r.id} className={i < pageItems.length - 1 ? 'border-b border-[#e5e5e5]' : ''}>
                          <td className="h-[56px] px-6 text-[#404040]">{r.name}</td>
                          <td className="h-[56px] px-2 text-[#404040]">{r.email}</td>
                          <td className="h-[56px] px-2 text-center">
                            <button
                              onClick={() => removeRecipient(r.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination row */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[14px] text-[#737373]">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, recipients.length)} of {recipients.length} entries
                  </span>
                  <nav className="flex items-center gap-1">
                    <Button variant="outline" size="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      Previous
                    </Button>
                    {pageNumbers.map((p, i) =>
                      p === '…' ? (
                        <Button key={i} variant="ghost" size="pagination">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          key={p}
                          variant={page === p ? 'outline' : 'ghost'}
                          size="pagination"
                          onClick={() => setPage(p as number)}
                        >
                          {p}
                        </Button>
                      )
                    )}
                    <Button variant="outline" size="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      Next
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Button>
                  </nav>
                </div>
              </div>
            )}

            {/* Send button — only after upload */}
            {uploaded && <div className="flex justify-end mt-6">
              <Button
                variant="default"
                size="default"
                className={`rounded-[8px] min-w-[148px] transition-colors ${sendState === 'sent' ? 'bg-green-600 hover:bg-green-600' : ''}`}
                disabled={sendState !== 'idle'}
                onClick={handleSend}
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
                {sendState === 'idle' ? 'Send' : sendState === 'sending' ? 'Sending…' : 'Sent!'}
              </Button>
            </div>}

          </div>
        </main>
      </div>
    </div>
  )
}
