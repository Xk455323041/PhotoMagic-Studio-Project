import React from 'react'
import { BookOpen, Video, FileText, PlayCircle, Download, Star, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const TutorialsPage: React.FC = () => {
  const tutorials = [
    {
      id: 1,
      title: '背景移除入门教程',
      description: '学习如何使用背景移除功能，从基础到高级技巧',
      duration: '15分钟',
      level: '初级',
      category: '背景处理',
      icon: <PlayCircle className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
      lessons: 8,
      completed: 65,
    },
    {
      id: 2,
      title: '专业证件照制作',
      description: '掌握各国证件照规格和制作技巧',
      duration: '25分钟',
      level: '中级',
      category: '证件照',
      icon: <Video className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      lessons: 12,
      completed: 40,
    },
    {
      id: 3,
      title: '背景替换高级技巧',
      description: '学习自然背景替换和光影匹配技术',
      duration: '30分钟',
      level: '高级',
      category: '背景处理',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      lessons: 15,
      completed: 20,
    },
    {
      id: 4,
      title: '老照片修复指南',
      description: '修复各种老照片问题的完整指南',
      duration: '40分钟',
      level: '中级',
      category: '修复',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'from-amber-500 to-orange-500',
      lessons: 20,
      completed: 10,
    },
  ]

  const quickGuides = [
    {
      title: '如何获得最佳背景移除效果',
      steps: ['上传高质量图片', '选择适当模式', '调整边缘设置', '预览并下载'],
      time: '5分钟',
    },
    {
      title: '证件照规格速查',
      steps: ['选择国家', '查看规格要求', '调整尺寸', '设置背景颜色'],
      time: '3分钟',
    },
    {
      title: '快速背景替换技巧',
      steps: ['选择匹配背景', '调整融合强度', '匹配光照', '最终调整'],
      time: '7分钟',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-2">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">教程与指南</h1>
        </div>
        <p className="text-lg text-gray-600">
          学习PhotoMagic Studio的所有功能，从基础到高级技巧。
        </p>
      </div>

      {/* 快速入门 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">快速入门指南</h2>
          <p className="text-sm text-gray-600">
            快速掌握核心功能的实用技巧
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickGuides.map((guide, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 hover:border-brand-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-3">{guide.title}</h3>
              
              <ol className="space-y-2 mb-4">
                {guide.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {stepIndex + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{guide.time}</span>
                </div>
                <Button size="sm" variant="outline">
                  开始学习
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 完整教程 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">完整视频教程</h2>
          <p className="text-sm text-gray-600">
            系统学习所有功能，从基础到精通
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${tutorial.color} text-white`}>
                  {tutorial.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tutorial.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{tutorial.description}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                      <Star className="h-3 w-3 text-amber-500" />
                      {tutorial.level}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{tutorial.lessons}</div>
                      <div className="text-xs text-gray-600">课程数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{tutorial.duration}</div>
                      <div className="text-xs text-gray-600">时长</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{tutorial.completed}%</div>
                      <div className="text-xs text-gray-600">完成度</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">学习进度</span>
                      <span className="font-medium text-gray-900">{tutorial.completed}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                        style={{ width: `${tutorial.completed}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <Button variant="primary" className="flex-1">
                      继续学习
                    </Button>
                    <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                      资料
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ部分 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">常见问题解答</h2>
          <p className="text-sm text-gray-600">
            快速找到您需要的答案
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: '如何处理复杂背景的图片？',
              answer: '对于复杂背景，建议使用"精细模式"，并适当调整边缘平滑度。对于毛发等细节，可以增加边缘融合强度。',
            },
            {
              question: '证件照有哪些规格要求？',
              answer: '不同国家有不同的规格要求。我们支持中国、美国、欧盟、日本等主要国家的标准规格，系统会自动检测并推荐最佳设置。',
            },
            {
              question: '老照片修复需要多长时间？',
              answer: '修复时间取决于照片的损坏程度和选择的修复模式。自动模式约2-3分钟，专业模式可能需要5-8分钟。',
            },
            {
              question: '如何获得最佳处理效果？',
              answer: '1. 使用高质量的原图 2. 根据图片特点选择合适模式 3. 适当调整参数 4. 处理前预览效果',
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-4 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                  Q
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习资源 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">学习资源下载</h2>
          <p className="text-sm text-gray-600">
            下载学习资料和模板文件
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '用户手册PDF',
              description: '完整的用户手册，包含所有功能说明',
              size: '8.5 MB',
              downloads: '1.2k',
              icon: <FileText className="h-6 w-6" />,
            },
            {
              title: '模板文件包',
              description: '包含各种证件照和背景模板',
              size: '25.3 MB',
              downloads: '856',
              icon: <Download className="h-6 w-6" />,
            },
            {
              title: '案例研究集',
              description: '成功案例和最佳实践分享',
              size: '15.7 MB',
              downloads: '543',
              icon: <BookOpen className="h-6 w-6" />,
            },
          ].map((resource, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 hover:border-brand-300 transition-colors"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  {resource.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">大小: </span>
                  <span className="font-medium text-gray-900">{resource.size}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{resource.downloads}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" fullWidth leftIcon={<Download className="h-4 w-4" />}>
                  下载资源
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorialsPage