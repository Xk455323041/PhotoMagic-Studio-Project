import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Mail, Heart } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo和描述 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎨</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PhotoMagic</span>
            </div>
            <p className="text-sm text-gray-600">
              智能图片处理平台，让每一张照片都变得完美。
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Xk455323041/PhotoMagic-Studio-Project"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 功能链接 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              功能
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/background-removal"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  背景移除
                </Link>
              </li>
              <li>
                <Link
                  to="/id-photo"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  证件照制作
                </Link>
              </li>
              <li>
                <Link
                  to="/background-replace"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  背景替换
                </Link>
              </li>
              <li>
                <Link
                  to="/photo-restoration"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  老照片修复
                </Link>
              </li>
            </ul>
          </div>

          {/* 资源链接 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              资源
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  使用教程
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  API文档
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  常见问题
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  更新日志
                </a>
              </li>
            </ul>
          </div>

          {/* 公司信息 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              公司
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  关于我们
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  联系我们
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  隐私政策
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                >
                  服务条款
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-600">
              © {currentYear} PhotoMagic Studio. 保留所有权利。
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>by PhotoMagic Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer