import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import StudentDetailSidebar from '@/components/layout/StudentDetailSidebar'
import { Button } from '@/components/ui/button'
import { loadAllKAPoints, kaTopicTotal, kaGrandTotal, CPD_KNOWLEDGE_AREAS, loadTopicConfig, DEFAULT_TOPIC_CONFIG, loadMembers } from '@/lib/cpdData'

// ── Gauge ─────────────────────────────────────────────────────────────────
const CIRC = parseFloat((2 * Math.PI * 30).toFixed(1)) // 188.5

interface GaugeProps {
  value: string
  color: string
  fillLength: number   // 0–CIRC
  dashed?: boolean
  label: string
  sublabel: string
  sublabelColor: string
  toggle?: boolean
  animDelay?: number   // ms
}

function Gauge({ value, color, fillLength, dashed, label, sublabel, sublabelColor, toggle, animDelay = 0 }: GaugeProps) {
  const [on, setOn] = useState(true)
  const offset = CIRC - fillLength
  const isEmpty = !dashed && fillLength === 0
  const activeArc = !dashed && fillLength > 0 && (!toggle || on)
  const activeEmpty = isEmpty && (!toggle || on)

  return (
    <div className={`bg-[#2f3e60] rounded-[17px] p-4 flex items-center gap-4 transition-opacity duration-300 ${toggle && !on ? 'opacity-40' : 'opacity-100'}`}>
      <div className="relative w-[77px] h-[77px] shrink-0">
        <svg width="77" height="77" viewBox="0 0 77 77" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track ring */}
          <circle
            cx="38.5" cy="38.5" r="30"
            stroke={dashed ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="7" fill="none"
          />
          {/* Empty gauge: faint full ring in category colour */}
          {activeEmpty && (
            <circle
              cx="38.5" cy="38.5" r="30"
              stroke={color} strokeWidth="7" fill="none"
              strokeOpacity={0.35}
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={0}
            />
          )}
          {/* Filled arc — animated */}
          {activeArc && (
            <circle
              cx="38.5" cy="38.5" r="30"
              stroke={color} strokeWidth="7" fill="none"
              strokeLinecap="round"
              className="gauge-arc"
              style={{
                '--gauge-offset': `${offset}`,
                animationDelay: `${animDelay}ms`,
              } as React.CSSProperties}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-[13px]">{value}</span>
        </div>
      </div>
      <div className={toggle ? 'flex-1 min-w-0' : ''}>
        {toggle ? (
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[12px] font-semibold text-white leading-[16.5px]">{label}</p>
            <button
              onClick={() => setOn(v => !v)}
              className={`rounded-full h-5 w-9 flex items-center transition-colors duration-200 shrink-0 ${on ? 'bg-[#3b82f6] justify-end pr-0.5' : 'bg-white/20 justify-start pl-0.5'}`}
              aria-label={on ? 'Disable Tax Advice' : 'Enable Tax Advice'}
            >
              <div className="bg-white rounded-full w-4 h-4 shadow-sm" />
            </button>
          </div>
        ) : (
          <p className="text-[12px] font-semibold text-white leading-[16.5px]">{label}</p>
        )}
        <p className="text-[12px]" style={{ color: sublabelColor, fontWeight: sublabelColor === 'rgba(255,255,255,0.4)' ? 400 : 500 }}>
          {sublabel}
        </p>
      </div>
    </div>
  )
}

// ── Subject tile ──────────────────────────────────────────────────────────
interface SubjectTileProps { label: string; value?: string }

function SubjectTile({ label, value }: SubjectTileProps) {
  const hasValue = value !== undefined
  return (
    <div className="bg-white border border-[#e2e2e2] rounded-[8px] h-14 flex items-center gap-2 pl-2 pr-px py-px">
      <div className={`rounded-[6px] h-7 w-8 flex items-center justify-center shrink-0 ${hasValue ? 'bg-[#dcfce7] border border-[#bbf7d0]' : 'bg-[#f1f1f1] border border-[#dbdbdb]'}`}>
        <span className={`text-[10px] font-semibold ${hasValue ? 'text-[#15803d]' : 'text-[#9ca3af]'}`}>{hasValue ? value : '–'}</span>
      </div>
      <span className="text-[12px] text-[#1a2744] whitespace-nowrap">{label}</span>
    </div>
  )
}

// ── Course card ───────────────────────────────────────────────────────────
interface CourseCardProps {
  title: string
  description: string
  categories: { label: string; active: boolean }[]
  topics: string[]
  points: number
  icon: 'headphones' | 'book' | 'file'
}

const HeadphonesIcon = () => (
  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
)

const BookIcon = () => (
  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const FileIcon = () => (
  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
)

const iconMap = { headphones: HeadphonesIcon, book: BookIcon, file: FileIcon }

function CourseCard({ title, description, categories, topics, points, icon }: CourseCardProps) {
  const Icon = iconMap[icon]
  return (
    <div className="relative rounded-[12px] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-14 bg-[#1a2744] rounded-tl-[12px] rounded-bl-[12px] flex items-center justify-center z-10">
        <Icon />
      </div>
      <div className="bg-white rounded-[12px] pl-[72px] pr-[106px] py-3 min-h-[120px]">
        <p className="text-[14px] font-semibold text-[#1a2744] leading-[19px] mb-1">{title}</p>
        <p className="text-[12px] text-[#6b7280] mb-2">{description}</p>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {categories.map((c) => (
            <span key={c.label} className={`text-[10px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap border ${c.active ? 'bg-[#f0fdfa] border-[#99f6e4] text-[#0d9488]' : 'bg-white border-[#e5e7eb] text-[#9ca3af]'}`}>
              {c.label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {topics.map((t) => (
            <span key={t} className="bg-[#cffafe] text-[#0c93b4] text-[8.5px] font-medium rounded-full px-2 py-1 whitespace-nowrap">{t}</span>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-[90px] bg-[#dbeafe] flex flex-col items-center justify-center rounded-[12px]">
        <span className="text-[16px] font-bold text-[#2563eb] leading-none">{points}</span>
        <span className="text-[10px] font-medium text-[#2563eb] mt-1">CPD Points</span>
      </div>
    </div>
  )
}

const ALL_CATEGORIES = ['Technical Competence', 'Professionalism & Ethics', 'Client Care & Practice', 'Regulatory Compliance', 'General', 'Tax (Financial) Advice']
const COMMON_TOPICS = ['Derivatives', 'Financial planning', 'Aged care', 'Retirement income streams', 'Self Managed Super Funds', 'Social Security', 'Compliance', 'Skills']

const courses: CourseCardProps[] = [
  {
    title: 'On Demand - Dr Katherine Hunt (MoneyMind) - 1.0 CPD',
    description: 'Exploring client psychology and behaviour in financial advice.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i < 3 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'headphones',
  },
  {
    title: 'Engine Room Audio Series 11 - Dr Paul Moran and Alex Hont',
    description: 'Best practice strategies for retirement income planning.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i !== 1 && i < 4 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'headphones',
  },
  {
    title: 'Optimal Super Strategies for Advisers (2024)',
    description: 'Advanced techniques for maximising client superannuation outcomes.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i === 0 || i === 2 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'book',
  },
  {
    title: 'Ethics in Practice: Navigating Complex Client Scenarios',
    description: 'Case studies and frameworks for ethical decision-making.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i === 1 || i === 4 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'file',
  },
  {
    title: 'Regulatory Update: ASIC Compliance Changes 2024',
    description: 'Key regulatory changes impacting financial advisers this year.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i === 3 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'file',
  },
  {
    title: 'Client Communication Mastery – Building Trust and Loyalty',
    description: 'Techniques for clear and empathetic client communication.',
    categories: ALL_CATEGORIES.map((l, i) => ({ label: l, active: i === 2 || i === 4 })),
    topics: COMMON_TOPICS,
    points: 1,
    icon: 'headphones',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────
const GAUGE_LABEL_MAP: Record<string, string> = {
  'Regulatory & Consumer Protection': 'Regulatory Compliance',
  'Tax Advice': 'Tax (Financial) Advice',
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const members = loadMembers()
  const member = members[parseInt(id ?? '0')] ?? members[0]

  const pts = loadAllKAPoints()[member.name] ?? {}
  const topicConfig = loadTopicConfig()

  const gauges: GaugeProps[] = CPD_KNOWLEDGE_AREAS.map((topic, i) => {
    const earned = kaTopicTotal(pts, topic)
    const cfg = topicConfig[topic.area] ?? DEFAULT_TOPIC_CONFIG[topic.area]
    const required = cfg?.minPerYear ?? 0
    const hasReq = required > 0
    const met = hasReq && earned >= required
    const fillLength = hasReq ? Math.min(earned / required, 1) * CIRC : 0
    const color = hasReq ? (met ? '#4ade80' : '#93c5fd') : ''
    const sublabel = hasReq ? (met ? 'Requirement met' : `${(required - earned).toFixed(1)} pts to go`) : 'No requirement'
    const sublabelColor = hasReq ? (met ? '#4ade80' : '#93c5fd') : 'rgba(255,255,255,0.4)'
    return {
      value: hasReq ? `${earned}/${required}` : `${earned}/–`,
      color, fillLength, dashed: !hasReq,
      label: GAUGE_LABEL_MAP[topic.area] ?? topic.area,
      sublabel, sublabelColor,
      toggle: topic.area === 'Tax Advice',
      animDelay: i * 100,
    }
  })

  const subjects: SubjectTileProps[] = CPD_KNOWLEDGE_AREAS.flatMap(topic =>
    topic.subs.map(sub => {
      const v = pts[sub]
      return { label: sub, value: v && v > 0 ? String(v) : undefined }
    })
  )

  const totalEarned = kaGrandTotal(pts)
  const totalRequired = CPD_KNOWLEDGE_AREAS.reduce((sum, t) => {
    const cfg = topicConfig[t.area] ?? DEFAULT_TOPIC_CONFIG[t.area]
    return sum + (cfg?.minPerYear ?? 0)
  }, 0)
  const pct = totalRequired > 0 ? Math.round((totalEarned / totalRequired) * 100) : 0

  function downloadStudentCSV() {
    const rows: string[][] = []
    rows.push([`Student Report: ${member.name}`])
    rows.push([])
    rows.push(['ANNUAL COMPLIANCE PROGRESS'])
    rows.push(['CPD Points Earned', 'CPD Points Required', 'Progress'])
    rows.push([String(totalEarned), String(totalRequired), `${pct}%`])
    rows.push([])
    rows.push(['CATEGORY BREAKDOWN'])
    rows.push(['Category', 'Progress', 'Status'])
    gauges.forEach(g => rows.push([g.label, g.value, g.sublabel]))
    rows.push([])
    rows.push(['SUBJECTS'])
    rows.push(['Subject', 'Points'])
    subjects.forEach(s => rows.push([s.label, s.value ?? '–']))
    rows.push([])
    rows.push(['COMPLETED EDUCATION'])
    rows.push(['Title', 'Description', 'CPD Points', 'Categories'])
    courses.forEach(c => rows.push([
      c.title, c.description, String(c.points),
      c.categories.filter(cat => cat.active).map(cat => cat.label).join('; '),
    ]))
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const a = document.createElement('a')
    a.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    a.setAttribute('download', `${member.name.toLowerCase().replace(/\s+/g, '-')}-report.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div>
      <Navbar breadcrumb={[{ label: 'Dashboard' }]} />
      <div className="w-full max-w-[1245px] mx-auto flex items-start">
        <StudentDetailSidebar />

        <main className="flex-1 min-w-0 p-4">
          {/* Back + name */}
          <div className="inline-flex items-center gap-2.5 mb-5 cursor-pointer" onClick={() => navigate(-1)}>
            <svg width="14" height="14" fill="none" stroke="#203649" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="text-[25px] font-semibold text-[#203649] leading-tight">{member.name}</span>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" className="h-[38px] px-4 text-[14px] font-medium text-[#1a2744] border-[#dbdbdb] gap-2">
              <svg width="15" height="15" fill="none" stroke="#1a2744" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import CPD Points
            </Button>
            <div className="flex items-center gap-4 cursor-pointer" onClick={downloadStudentCSV}>
              <span className="text-[13px] font-semibold text-[#0a0a0a]">Export Entire Report to CSV</span>
              <Button variant="blue" size="icon-lg">
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6M9 15l3 3 3-3" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Annual Compliance Progress */}
          <div className="bg-[#1d2543] border border-white/10 rounded-[21px] p-3 mb-4">
            <div className="bg-white rounded-[17px] px-5 pt-5 pb-4 mb-3">
              <p className="text-[14px] font-semibold text-[#1a2744] mb-3">Annual Compliance Progress</p>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[50px] font-bold text-[#1182e3] leading-none">{totalEarned}</p>
                  <p className="text-[14px] text-[#6b7280] mt-1">of {totalRequired} <span className="text-[#1182e3] font-medium">CPD points</span> earned</p>
                </div>
                <p className="text-[20px] font-bold text-[#1a2744]">{pct}%</p>
              </div>
              <div className="bg-[#e5e7eb] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1182e3] h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {gauges.map((g) => <Gauge key={g.label} {...g} />)}
            </div>
          </div>

          {/* Subject grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {subjects.map((s) => <SubjectTile key={s.label} {...s} />)}
          </div>

          {/* My Completed Education */}
          <p className="text-[14px] font-semibold text-[#1a2744] mb-2.5">My Completed Education</p>
          <div className="flex flex-col gap-2 pb-8">
            {courses.map((c) => <CourseCard key={c.title} {...c} />)}
          </div>

        </main>
      </div>
    </div>
  )
}
