import React, { useState } from 'react'
import { HelpCircle, MessageSquare, Mail, Phone, Search, FileText, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: '全部', count: 45 },
    { id: 'getting-started', name: '入门指南', count: 12 },
    { id: 'features', name: '功能使用', count: 18 },
    { id: 'account', name: '账户问题', count: 8 },
    { id: 'billing', name: '账单问题', count: 5 },
    { id: 'technical', name: '技术问题', count: 10 },
  ]

  const faqs = [
    {
      id: 1,
      question: '如何上传图片？',
      answer: '点击页面中的"上传"按钮或拖放文件到指定区域。支持JPG、PNG、WebP格式，最大20MB。',
      category: 'getting-started',
      views: 1250,
      helpful: 98,
    },
    {
      id: 2,
      question: '背景移除功能支持哪些图片格式？',
      answer: '支持JPG、PNG、WebP格式。对于最佳效果，建议使用PNG格式的高质量图片。',
      category: 'features',
      views: 890,
      helpful: 95,
    },
    {
      id: 3,
      question: '证件照制作有哪些规格？',
      answer: '支持中国、美国、欧盟、日本等国家的标准规格，包括一寸、二寸、护照照片等。',
      category: 'features',
      views: 750,
      helpful: 96,
    },
    {
      id: 4,
      question: '老照片修复需要多长时间？',
      answer: '修复时间取决于照片损坏程度。自动模式约2-3分钟，专业模式可能需要5-8分钟。',
      category: 'features',
      views: 620,
      helpful: 92,
    },
    {
      id: 5,
      question: '如何下载处理后的图片？',
      answer: '处理完成后，点击"下载"按钮即可保存图片。支持PNG、JPG格式，可选择不同质量。',
      category: 'getting-started',
      views: 1100,
      helpful: 97,
    },
    {
      id: 6,
      question: '免费版有哪些限制？',
      answer: '免费版每月可处理100张图片，支持基础功能。高级功能需要升级到专业版。',
      category: 'account',
      views: 850,
      helpful: 94,
    },
  ]

  const contactMethods = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: '在线客服',
      description: '实时在线解答问题',
      responseTime: '5分钟内',
      available: true,
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: '电子邮件',
      description: '24小时内回复',
      responseTime: '24小时内',
      available: true,
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: '电话支持',
      description: '工作日9:00-18:00',
      responseTime: '即时',
      available: false,
    },
  ]

  const filteredFaqs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-2">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">帮助与支持</h1>
        </div>
        <p className="text-lg text-gray-600">
          在这里找到您需要的答案，或联系我们的支持团队。
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">搜索帮助文档</h2>
          <p className="text-sm text-gray-600">
            输入关键词搜索相关帮助内容
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="输入您的问题，例如：如何上传图片、证件照规格..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">热门搜索：</span>
          {['背景移除', '证件照制作', '老照片修复', '账户升级', '下载问题'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 分类导航 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">按类别浏览</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`
                rounded-lg border p-4 text-center transition-all
                ${selectedCategory === category.id
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="font-medium text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-600">{category.count} 篇文章</div>
            </button>
          ))}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">常见问题</h2>
          <p className="text-sm text-gray-600">
            大多数用户遇到的问题和解决方案
          </p>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-lg border border-gray-200 p-6 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{faq.views} 次浏览</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{faq.helpful}% 有帮助</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    {categories.find(c => c.id === faq.category)?.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 联系支持 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">联系支持团队</h2>
          <p className="text-sm text-gray-600">
            如果找不到答案，请联系我们的支持团队
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className={`rounded-lg border p-6 ${method.available ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
            >
              <div className="mb-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${method.available ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                  {method.icon}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <Clock className="inline h-4 w-4 mr-1" />
                  响应: {method.responseTime}
                </div>
                <Button
                  variant={method.available ? 'primary' : 'outline'}
                  size="sm"
                  disabled={!method.available}
                >
                  {method.available ? '立即联系' : '暂不可用'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 帮助资源 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">帮助资源</h2>
          <p className="text-sm text-gray-600">
            更多学习资料和文档
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '用户手册',
              description: '完整的用户使用指南',
              icon: <FileText className="h-6 w-6" />,
              link: '#',
            },
            {
              title: '视频教程',
              description: '观看视频学习功能',
              icon: <MessageSquare className="h-6 w-6" />,
              link: '#',
            },
            {
              title: 'API文档',
              description: '开发者接口文档',
              icon: <HelpCircle className="h-6 w-6" />,
              link: '#',
            },
            {
              title: '社区论坛',
              description: '与其他用户交流',
              icon: <MessageSquare className="h-6 w-6" />,
              link: '#',
            },
          ].map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              className="group block rounded-lg border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                  {resource.icon}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600">{resource.description}</p>
              
              <div className="mt-4 text-sm font-medium text-brand-600 group-hover:text-brand-700">
                查看详情 →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 问题反馈 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">问题反馈</h3>
            <p className="text-blue-800 mb-4">
              如果您的问题没有在这里找到答案，或者发现了错误，请告诉我们。
              您的反馈将帮助我们改进产品。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">提交反馈</Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                报告问题
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage