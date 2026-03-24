import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost'
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border border-gray-200 shadow-sm',
      outline: 'border border-gray-300 bg-transparent',
      ghost: 'bg-transparent',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantClasses[variant],
          hoverable && 'transition-all hover:shadow-md',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
    )
  }
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center px-6 py-4 border-t border-gray-200',
          alignClasses[align],
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }