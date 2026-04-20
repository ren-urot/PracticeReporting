import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#171717] text-white hover:bg-black',
        outline: 'border border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-gray-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
        ghost: 'hover:bg-gray-100 text-[#0a0a0a]',
        blue: 'bg-[#1182e3] text-white hover:bg-blue-600',
      },
      size: {
        default: 'h-[35px] px-4',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9',
        'icon-round': 'h-9 w-9 rounded-full',
        'icon-lg': 'h-10 w-10 rounded-full',
        pagination: 'h-9 w-9 rounded-lg text-sm',
        'pagination-btn': 'h-9 px-3 rounded-lg text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
