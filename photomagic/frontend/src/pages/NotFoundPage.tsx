import React from 'react'
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404图标 */}
        <div className="relative mb-8">
          <div className="mx-auto h-48 w-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-gray-300">404</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="h-24 w-24 text-gray-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* 标题和描述 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">页面未找到</h1>
        <p className="text-lg text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移动。
          请检查URL是否正确，或返回首页继续浏览。
        </p>

        {/* 搜索建议 */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索您需要的内容..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
          <Button variant="outline" fullWidth>
            搜索网站内容
          </Button>
        </div>

        {/* 快速链接 */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4">快速导航</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: '背景移除', path: '/background-removal' },
              { name: '证件照制作', path: '/id-photo' },
              { name: '背景替换', path: '/background-replace' },
              { name: '老照片修复', path: '/photo-restoration' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-lg border border-gray-200 bg-white p-4 text-center hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="font-medium text-gray-900">{link.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            fullWidth
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            onClick={() => window.history.back()}
          >
            返回上一页
          </Button>
          <Link to="/" className="flex-1">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Home className="h-5 w-5" />}
            >
              返回首页
            </Button>
          </Link>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            需要帮助？{' '}
            <Link to="/help" className="font-medium text-brand-600 hover:text-brand-700">
              联系支持团队
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage