import React from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
  className?: string
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isExiting, setIsExiting] = React.useState(false)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.(id)
    }, 300)
  }

  const typeConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
    },
  }

  const config = typeConfig[type]

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300',
        config.bgColor,
        config.borderColor,
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start p-4">
        <div className={cn('flex-shrink-0', config.iconColor)}>
          {config.icon}
        </div>
        
        <div className="ml-3 flex-1">
          <p className={cn('text-sm font-medium', config.textColor)}>
            {title}
          </p>
          
          {message && (
            <p className={cn('mt-1 text-sm', config.textColor)}>
              {message}
            </p>
          )}
        </div>
        
        <button
          type="button"
          className={cn(
            'ml-4 inline-flex flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5',
            config.textColor
          )}
          onClick={handleClose}
          aria-label="关闭通知"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* 进度条 */}
      {duration > 0 && (
        <div className="h-1 w-full bg-gray-200">
          <div
            className={cn(
              'h-full transition-all duration-100 ease-linear',
              type === 'success' && 'bg-green-500',
              type === 'error' && 'bg-red-500',
              type === 'info' && 'bg-blue-500',
              type === 'warning' && 'bg-yellow-500'
            )}
            style={{
              width: isExiting ? '0%' : '100%',
              transition: isExiting
                ? 'width 0.3s ease-out'
                : `width ${duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  maxToasts?: number
  className?: string
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
  maxToasts = 5,
  className,
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  }

  const displayedToasts = toasts.slice(0, maxToasts)

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        positionClasses[position],
        className
      )}
    >
      {displayedToasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Toast 管理器 Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = crypto.randomUUID()
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    return id
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'error', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) {
    return showToast({ type: 'info', title, message, duration })
  }

  const showWarning = (title: string, message?: string, duration?: number) {
    return showToast({ type: 'warning', title, message, duration })
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const closeAllToasts = () => {
    setToasts([])
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeToast,
    closeAllToasts,
    ToastContainer,
  }
}

export default Toast