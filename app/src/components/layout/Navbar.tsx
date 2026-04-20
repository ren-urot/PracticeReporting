import { Link } from 'react-router-dom'

interface NavbarProps {
  breadcrumb?: { label: string; href?: string }[]
}

export default function Navbar({ breadcrumb = [] }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 h-[52px] bg-white border-b border-[#e5e5e5] w-full">
      <div className="w-full max-w-[1245px] mx-auto h-full flex items-center justify-between pr-4">
        <div className="flex items-center gap-4 h-full">
          <div className="h-full flex items-center justify-start shrink-0 pl-3">
            <img src={`${import.meta.env.BASE_URL}img/logo.png`} alt="CPDcheck" width={102} height={19} />
          </div>
          <div className="h-4 w-px bg-[#e5e5e5] shrink-0" />
          <nav className="flex items-center gap-[10px]">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-[10px]">
                {i > 0 && (
                  <svg width="14" height="14" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-[14px] text-[#737373] font-normal hover:text-[#0a0a0a] transition-colors whitespace-nowrap">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[14px] text-[#0a0a0a] font-normal whitespace-nowrap">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
