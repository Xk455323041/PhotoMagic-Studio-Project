import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/utils/cn'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'underline' | 'pills'
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  children,
  className,
  variant = 'default',
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  icon,
}) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

  const variantClasses = {
    default: isActive
      ? 'bg-gray-100 text-gray-900'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
    underline: isActive
      ? 'border-b-2 border-brand-600 text-brand-600'
      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300',
    pills: isActive
      ? 'bg-brand-600 text-white'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        variantClasses['default'], // 使用默认样式
        className
      )}
      onClick={() => setActiveTab(value)}
      aria-selected={isActive}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }

  const { activeTab } = context

  if (activeTab !== value) return null

  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }