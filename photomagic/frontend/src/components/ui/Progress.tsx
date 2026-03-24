import React from 'react'
import { cn } from '@/utils/cn'

interface ProgressProps {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showValue?: boolean
  valueFormat?: (value: number) => string
  className?: string
  label?: string
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  valueFormat,
  className,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }
  
  const variantClasses = {
    default: 'bg-brand-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  }
  
  const formattedValue = valueFormat ? valueFormat(value) : `${Math.round(percentage)}%`
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-gray-500">{formattedValue}</span>
          )}
        </div>
      )}
      
      <div className={cn('w-full overflow-hidden rounded-full bg-gray-200', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showValue?: boolean
  valueFormat?: (value: number) => string
  className?: string
  label?: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 40,
  strokeWidth = 4,
  variant = 'default',
  showValue = false,
  valueFormat,
  className,
  label,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  const variantColors = {
    default: 'stroke-brand-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    danger: 'stroke-red-600',
    info: 'stroke-blue-600',
  }
  
  const formattedValue = valueFormat ? valueFormat(value) : `${Math.round(percentage)}%`
  
  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-gray-200 fill-none"
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={cn('fill-none transition-all duration-300 ease-in-out', variantColors[variant])}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {formattedValue}
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="mt-2 text-xs text-gray-600">{label}</span>
      )}
    </div>
  )
}

interface MultiStepProgressProps {
  steps: Array<{
    id: string
    label: string
    status: 'pending' | 'current' | 'completed' | 'error'
  }>
  currentStep: string
  className?: string
}

const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep)
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isError = step.status === 'error'
          
          return (
            <React.Fragment key={step.id}>
              {/* 步骤点 */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : isCurrent
                      ? 'border-brand-600 bg-white text-brand-600'
                      : isError
                      ? 'border-red-600 bg-white text-red-600'
                      : 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isError ? '!' : index + 1}
                </div>
                
                {/* 步骤标签 */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCompleted || isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    index < currentIndex
                      ? 'bg-brand-600'
                      : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export { Progress, CircularProgress, MultiStepProgress }