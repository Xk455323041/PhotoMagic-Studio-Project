import React, { useState } from 'react'
import { Settings, User, Bell, Globe, Shield, CreditCard, Moon, Download, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    updates: true,
  })
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('zh-CN')
  const [autoSave, setAutoSave] = useState(true)

  const tabs = [
    { id: 'general', name: '通用设置', icon: <Settings className="h-5 w-5" /> },
    { id: 'account', name: '账户设置', icon: <User className="h-5 w-5" /> },
    { id: 'notifications', name: '通知', icon: <Bell className="h-5 w-5" /> },
    { id: 'privacy', name: '隐私与安全', icon: <Shield className="h-5 w-5" /> },
    { id: 'billing', name: '账单', icon: <CreditCard className="h-5 w-5" /> },
  ]

  const languages = [
    { code: 'zh-CN', name: '简体中文', native: '中文' },
    { code: 'en-US', name: 'English', native: 'English' },
    { code: 'ja-JP', name: 'Japanese', native: '日本語' },
    { code: 'ko-KR', name: 'Korean', native: '한국어' },
  ]

  const handleSaveSettings = () => {
    alert('设置已保存')
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 p-2">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">设置</h1>
        </div>
        <p className="text-lg text-gray-600">
          管理您的账户偏好和应用程序设置。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧导航 */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors
                    ${activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={activeTab === tab.id ? 'text-brand-600' : 'text-gray-400'}>
                    {tab.icon}
                  </div>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* 通用设置 */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">通用设置</h2>
                  
                  <div className="space-y-6">
                    {/* 语言设置 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">语言设置</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`
                              rounded-lg border p-4 text-left transition-all
                              ${language === lang.code
                                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="font-medium text-gray-900">{lang.name}</div>
                            <div className="text-sm text-gray-600">{lang.native}</div>
                            {language === lang.code && (
                              <div className="mt-2 text-xs text-brand-600 font-medium">
                                ✓ 当前语言
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 主题设置 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Moon className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">主题设置</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', name: '浅色', description: '明亮界面' },
                          { id: 'dark', name: '深色', description: '护眼模式' },
                          { id: 'auto', name: '自动', description: '跟随系统' },
                        ].map((themeOption) => (
                          <button
                            key={themeOption.id}
                            onClick={() => setTheme(themeOption.id)}
                            className={`
                              rounded-lg border p-4 text-center transition-all
                              ${theme === themeOption.id
                                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="font-medium text-gray-900">{themeOption.name}</div>
                            <div className="text-sm text-gray-600">{themeOption.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 其他设置 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">自动保存</h4>
                          <p className="text-sm text-gray-600">自动保存处理进度和设置</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={autoSave}
                            onChange={(e) => setAutoSave(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">高清下载</h4>
                          <p className="text-sm text-gray-600">默认下载高清版本图片</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            defaultChecked={true}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">快捷键提示</h4>
                          <p className="text-sm text-gray-600">显示键盘快捷键提示</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            defaultChecked={true}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 账户设置 */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">账户设置</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          用户名
                        </label>
                        <input
                          type="text"
                          defaultValue="user123"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          电子邮箱
                        </label>
                        <input
                          type="email"
                          defaultValue="user@example.com"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        rows={4}
                        defaultValue="PhotoMagic Studio 用户"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                      />
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="font-medium text-gray-900 mb-2">账户统计</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">156</div>
                          <div className="text-sm text-gray-600">处理图片</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">42</div>
                          <div className="text-sm text-gray-600">保存项目</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">28天</div>
                          <div className="text-sm text-gray-600">使用时长</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 通知设置 */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">通知设置</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key === 'email' && '邮件通知'}
                            {key === 'push' && '推送通知'}
                            {key === 'marketing' && '营销信息'}
                            {key === 'updates' && '更新通知'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {key === 'email' && '接收账户相关的邮件通知'}
                            {key === 'push' && '接收应用内的推送通知'}
                            {key === 'marketing' && '接收产品更新和优惠信息'}
                            {key === 'updates' && '接收系统更新和维护通知'}
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications({
                              ...notifications,
                              [key]: e.target.checked
                            })}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 隐私与安全 */}
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">隐私与安全</h2>
                  
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium text-gray-900 mb-2">数据隐私</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        我们尊重您的隐私。所有上传的图片仅用于处理目的，不会用于其他用途。
                      </p>
                      <Button variant="outline" size="sm">查看隐私政策</Button>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium text-gray-900 mb-2">数据管理</h4>
                      <div className="space-y-3">
                        <Button variant="outline" fullWidth leftIcon={<Download className="h-4 w-4" />}>
                          导出我的数据
                        </Button>
                        <Button variant="outline" fullWidth className="text-red-600 hover:text-red-700">
                          删除所有数据
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 账单设置 */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">账单设置</h2>
                  
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">免费版</h3>
                          <p className="text-sm text-gray-600">基础功能，每月100次处理</p>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">¥0<span className="text-sm font-normal text-gray-600">/月</span></div>
                      </div>
                      <Button variant="primary" fullWidth>当前套餐</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-2">支付方式</h4>
                        <p className="text-sm text-gray-600">暂无支付方式</p>
                        <Button variant="outline" size="sm" className="mt-2">添加支付方式</Button>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="font-medium text-gray-900 mb-2">账单历史</h4>
                        <p className="text-sm text-gray-600">暂无账单记录</p>
                        <Button variant="outline" size="sm" className="mt-2">查看历史</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  leftIcon={<Save className="h-5 w-5" />}
                  onClick={handleSaveSettings}
                >
                  保存设置
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage