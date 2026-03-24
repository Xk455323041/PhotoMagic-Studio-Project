import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  maxWidth?: number
  className?: string
  contentClassName?: string
  disabled?: boolean
  interactive?: boolean
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 200,
  className,
  contentClassName,
  disabled = false,
  interactive = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        updatePosition()
        setIsVisible(true)
      }, delay)
    } else {
      updatePosition()
      setIsVisible(true)
    }
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const updatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.top
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2
        y = triggerRect.bottom
        break
      case 'left':
        x = triggerRect.left
        y = triggerRect.top + triggerRect.height / 2
        break
      case 'right':
        x = triggerRect.right
        y = triggerRect.top + triggerRect.height / 2
        break
    }

    setCoords({ x, y })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      
      const handleScroll = () => {
        if (!interactive) {
          hideTooltip()
        } else {
          updatePosition()
        }
      }

      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible, interactive])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900',
  }

  const arrowStyles = {
    top: { borderWidth: '4px 4px 0 4px' },
    bottom: { borderWidth: '0 4px 4px 4px' },
    left: { borderWidth: '4px 0 4px 4px' },
    right: { borderWidth: '4px 4px 4px 0' },
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? `tooltip-${coords.x}-${coords.y}` : undefined}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={`tooltip-${coords.x}-${coords.y}`}
            className="fixed z-50"
            style={{
              left: coords.x,
              top: coords.y,
              transform: 'translate(-50%, -50%)',
            }}
            role="tooltip"
            onMouseEnter={interactive ? undefined : hideTooltip}
            onMouseLeave={interactive ? undefined : hideTooltip}
          >
            <div
              className={cn(
                'relative rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg',
                positionClasses[position],
                contentClassName
              )}
              style={{ maxWidth }}
            >
              {content}
              
              {/* 箭头 */}
              <div
                className={cn(
                  'absolute h-0 w-0 border-transparent',
                  arrowClasses[position]
                )}
                style={arrowStyles[position]}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

interface TooltipProviderProps {
  children: React.ReactNode
  skipDelayDuration?: number
  delayDuration?: number
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  skipDelayDuration = 300,
  delayDuration = 800,
}) => {
  return (
    <div
      data-skip-delay-duration={skipDelayDuration}
      data-delay-duration={delayDuration}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipProvider }