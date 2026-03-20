import React from 'react'
import { Menu, Search, Bell, User, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧：菜单按钮和Logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden -ml-2 rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <span className="sr-only">打开菜单</span>
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" className="ml-4 flex items-center lg:ml-0">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎨</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">PhotoMagic</h1>
                  <p className="text-xs text-gray-500">智能图片处理平台</p>
                </div>
              </div>
            </Link>
          </div>

          {/* 中间：搜索框 */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="搜索功能、文档或帮助..."
              />
            </div>
          </div>

          {/* 右侧：用户操作 */}
          <div className="flex items-center space-x-4">
            {/* 通知 */}
            <button className="relative rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <span className="sr-only">查看通知</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* 设置 */}
            <button className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <span className="sr-only">设置</span>
              <Settings className="h-5 w-5" />
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <button className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">用户</p>
                  <p className="text-xs text-gray-500">点击登录</p>
                </div>
              </button>
            </div>

            {/* 开始使用按钮 */}
            <Button variant="primary" size="sm">
              开始免费使用
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header