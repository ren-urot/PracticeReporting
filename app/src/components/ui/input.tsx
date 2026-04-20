import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border border-[#cacaca] rounded-[4px] h-[35px] px-2.5 text-[14px] bg-white focus:outline-none focus:border-[#1182e3] placeholder:text-[#a1a1a1]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
