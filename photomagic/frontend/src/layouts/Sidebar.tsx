import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Scissors, 
  Camera, 
  Image, 
  Clock, 
  Settings, 
  HelpCircle, 
  FileText,
  X,
  Sparkles
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '背景移除', href: '/background-removal', icon: Scissors },
    { name: '证件照制作', href: '/id-photo', icon: Camera },
    { name: '背景替换', href: '/background-replace', icon: Image },
    { name: '老照片修复', href: '/photo-restoration', icon: Clock },
  ]

  const secondaryNavigation = [
    { name: '使用教程', href: '/tutorials', icon: FileText },
    { name: '设置', href: '/settings', icon: Settings },
    { name: '帮助中心', href: '/help', icon: HelpCircle },
  ]

  return (
    <>
      {/* 移动端侧边栏 */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎨</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PhotoMagic</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              其他
            </p>
            <div className="mt-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* AI功能提示 */}
          <div className="mt-8 mx-4">
            <div className="rounded-lg bg-gradient-to-r from-brand-50 to-blue-50 p-4 border border-brand-100">
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 text-brand-600 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-900">AI智能处理</p>
                  <p className="mt-1 text-xs text-brand-700">
                    所有功能均采用最新AI技术，处理效果更精准
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* 桌面端侧边栏 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PhotoMagic</h1>
                <p className="text-xs text-gray-500">智能图片处理平台</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col px-4 pb-4">
            <div className="mt-6 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-lg bg-gradient-to-r from-brand-50 to-blue-50 p-4 border border-brand-100">
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-brand-900">AI智能处理</p>
                    <p className="mt-1 text-xs text-brand-700">
                      所有功能均采用最新AI技术，处理效果更精准
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar