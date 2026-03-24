import React from 'react'
import { 
  Scissors, 
  Camera, 
  Image, 
  Clock, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  Star,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Scissors className="h-12 w-12" />,
      title: '背景移除',
      description: '快速移除图片背景，生成透明PNG。支持复杂背景和毛发边缘处理。',
      link: '/background-removal',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Camera className="h-12 w-12" />,
      title: '证件照制作',
      description: '专业证件照制作工具，支持各国标准规格，一键生成打印版。',
      link: '/id-photo',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Image className="h-12 w-12" />,
      title: '背景替换',
      description: '智能替换图片背景，支持自定义背景和AI推荐场景。',
      link: '/background-replace',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Clock className="h-12 w-12" />,
      title: '老照片修复',
      description: 'AI智能修复老照片，去除折痕、划痕、污渍，恢复色彩和清晰度。',
      link: '/photo-restoration',
      color: 'from-amber-500 to-orange-500',
    },
  ]

  const stats = [
    { label: '用户数量', value: '10万+', icon: <Users className="h-5 w-5" /> },
    { label: '处理图片', value: '500万+', icon: <Image className="h-5 w-5" /> },
    { label: '处理速度', value: '<3秒', icon: <Zap className="h-5 w-5" /> },
    { label: '满意度', value: '98%', icon: <Star className="h-5 w-5" /> },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-blue-50 py-12 px-6 lg:py-20">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
            <Zap className="mr-2 h-4 w-4" />
            新一代AI图片处理平台
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            智能图片处理，
            <span className="block text-brand-600">让每一张照片都完美</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            PhotoMagic Studio 提供专业的AI图片处理功能，包括背景移除、证件照制作、背景替换、老照片修复等，满足您的所有图片处理需求。
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="primary">
              开始免费使用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              查看功能演示
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            核心功能
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            一站式解决您的所有图片处理需求
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}`} />
              </div>
              
              {/* 按钮图标 - 大尺寸 */}
              <div className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              
              {/* 按钮名称 */}
              <h3 className="relative mb-3 text-xl font-bold text-gray-900">
                {feature.title}
              </h3>
              
              {/* 功能说明 */}
              <p className="relative mb-6 text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* 使用提示 */}
              <div className="relative inline-flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                <span className="mr-2">开始使用</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
              
              {/* 悬停效果 */}
              <div className={`absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
            </a>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-6 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              值得信赖的图片处理平台
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              服务全球用户，处理数百万张图片
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-xl bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 p-2">
                    {stat.icon}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-12 px-6 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            立即开始您的图片处理之旅
          </h2>
          
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            无需下载安装，打开浏览器即可使用。支持多种图片格式，处理效果专业精准。
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-brand-700 hover:bg-gray-100"
            >
              注册免费账户
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              查看定价方案
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-brand-200">
            无需信用卡，免费试用所有功能
          </p>
        </div>
      </section>
    </div>
  )
}

export default HomePage