import React, { useState } from 'react'
import { Image, Upload, Palette, Mountain, Home, Sparkles, Download, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import FileUpload from '@/components/upload/FileUpload'

const BackgroundReplacePage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  // 背景库
  const backgroundCategories = [
    {
      id: 'scenes',
      name: '场景',
      icon: <Mountain className="h-5 w-5" />,
      backgrounds: [
        { id: 'beach', name: '海滩', color: 'from-blue-400 to-cyan-300', thumbnail: '🏖️' },
        { id: 'mountain', name: '山脉', color: 'from-green-500 to-emerald-400', thumbnail: '⛰️' },
        { id: 'city', name: '城市', color: 'from-gray-600 to-gray-400', thumbnail: '🏙️' },
        { id: 'office', name: '办公室', color: 'from-blue-100 to-gray-100', thumbnail: '🏢' },
        { id: 'studio', name: '摄影棚', color: 'from-gray-200 to-white', thumbnail: '📸' },
        { id: 'nature', name: '自然', color: 'from-green-400 to-green-300', thumbnail: '🌳' },
      ],
    },
    {
      id: 'colors',
      name: '纯色',
      icon: <Palette className="h-5 w-5" />,
      backgrounds: [
        { id: 'blue', name: '蓝色', color: 'bg-blue-600', thumbnail: '🔵' },
        { id: 'white', name: '白色', color: 'bg-white border', thumbnail: '⚪' },
        { id: 'gray', name: '灰色', color: 'bg-gray-600', thumbnail: '⚫' },
        { id: 'green', name: '绿色', color: 'bg-green-600', thumbnail: '🟢' },
        { id: 'gradient1', name: '渐变1', color: 'bg-gradient-to-br from-purple-500 to-pink-500', thumbnail: '🌈' },
        { id: 'gradient2', name: '渐变2', color: 'bg-gradient-to-br from-blue-500 to-cyan-500', thumbnail: '🌊' },
      ],
    },
    {
      id: 'custom',
      name: '自定义',
      icon: <Upload className="h-5 w-5" />,
      backgrounds: [
        { id: 'upload', name: '上传背景', color: 'bg-gradient-to-br from-amber-400 to-orange-500', thumbnail: '📁' },
        { id: 'ai', name: 'AI生成', color: 'bg-gradient-to-br from-purple-500 to-pink-500', thumbnail: '🤖' },
        { id: 'url', name: 'URL链接', color: 'bg-gradient-to-br from-blue-400 to-cyan-400', thumbnail: '🔗' },
      ],
    },
  ]

  // AI推荐背景
  const aiRecommendations = [
    { id: 'ai1', name: '专业会议', score: 95, color: 'from-blue-500 to-blue-700' },
    { id: 'ai2', name: '自然风光', score: 88, color: 'from-green-500 to-emerald-600' },
    { id: 'ai3', name: '简约现代', score: 92, color: 'from-gray-700 to-gray-900' },
    { id: 'ai4', name: '创意艺术', score: 85, color: 'from-purple-500 to-pink-500' },
  ]

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setProcessed(false)
  }

  const handleProcess = () => {
    if (!uploadedFile || !selectedBackground) return
    
    setProcessing(true)
    // 模拟处理过程
    setTimeout(() => {
      setProcessing(false)
      setProcessed(true)
    }, 2500)
  }

  const handleDownload = () => {
    if (!processed) {
      alert('请先处理图片')
      return
    }
    
    // 模拟下载功能
    const mockFileName = `background_replaced_${Date.now()}.png`
    const mockFileUrl = URL.createObjectURL(
      new Blob(['mock background replaced image'], { type: 'image/png' })
    )
    
    const link = document.createElement('a')
    link.href = mockFileUrl
    link.download = mockFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(mockFileUrl)
    
    alert('下载开始')
  }

  const handleReset = () => {
    setUploadedFile(null)
    setSelectedBackground(null)
    setProcessed(false)
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2">
            <Image className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">背景替换</h1>
        </div>
        <p className="text-lg text-gray-600">
          智能替换图片背景，支持自定义背景和AI推荐场景。
        </p>
      </div>

      {/* 主要工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：上传和背景选择 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 上传原图 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">上传原图</h2>
              <p className="text-sm text-gray-600">
                上传需要替换背景的图片
              </p>
            </div>
            
            <FileUpload
              onFileUpload={handleFileUpload}
              acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              maxSize={20 * 1024 * 1024}
            />
          </div>

          {/* 背景库 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">选择背景</h2>
              <p className="text-sm text-gray-600">
                从丰富的背景库中选择或上传自定义背景
              </p>
            </div>

            {backgroundCategories.map((category) => (
              <div key={category.id} className="mb-8 last:mb-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-gray-500">{category.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {category.backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`
                        group relative aspect-square rounded-lg border-2 p-4 transition-all
                        ${selectedBackground === bg.id
                          ? 'border-brand-500 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`absolute inset-0 rounded ${bg.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <span className="text-2xl mb-2">{bg.thumbnail}</span>
                        <span className="text-xs font-medium text-gray-900 bg-white/80 px-2 py-1 rounded">
                          {bg.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI智能推荐 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-900">AI智能推荐</h2>
              </div>
              <p className="text-sm text-gray-600">
                基于图片内容智能推荐最适合的背景
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {aiRecommendations.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setSelectedBackground(`ai_${rec.id}`)}
                  className={`
                    group relative rounded-xl border p-4 text-left transition-all
                    ${selectedBackground === `ai_${rec.id}`
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${rec.color} opacity-10 group-hover:opacity-20`} />
                  
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{rec.name}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-purple-600">
                        <Sparkles className="h-3 w-3" />
                        {rec.score}%
                      </span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                    
                    <p className="mt-3 text-xs text-gray-600">
                      AI分析认为此背景与您的图片最匹配
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：预览和设置 */}
        <div className="space-y-6">
          {/* 预览区域 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">效果预览</h3>
            
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mb-4">
              {!uploadedFile ? (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900">等待上传图片</p>
                  <p className="text-sm text-gray-600">请先上传需要处理的图片</p>
                </div>
              ) : !selectedBackground ? (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Palette className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-900">图片已就绪</p>
                  <p className="text-sm text-gray-600">请选择背景</p>
                </div>
              ) : processing ? (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-brand-600 animate-pulse" />
                  </div>
                  <p className="text-gray-900">AI处理中</p>
                  <p className="text-sm text-gray-600">正在智能替换背景</p>
                </div>
              ) : processed ? (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-900">处理完成</p>
                  <p className="text-sm text-gray-600">背景已成功替换</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-900">准备就绪</p>
                  <p className="text-sm text-gray-600">点击开始处理按钮</p>
                </div>
              )}
            </div>

            {/* 状态指示器 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">原图状态:</span>
                <span className={`font-medium ${uploadedFile ? 'text-green-600' : 'text-gray-400'}`}>
                  {uploadedFile ? '✓ 已上传' : '等待上传'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">背景选择:</span>
                <span className={`font-medium ${selectedBackground ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedBackground ? '✓ 已选择' : '未选择'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">处理状态:</span>
                <span className={`font-medium ${processed ? 'text-green-600' : processing ? 'text-brand-600' : 'text-gray-400'}`}>
                  {processed ? '✓ 已完成' : processing ? '处理中...' : '等待处理'}
                </span>
              </div>
            </div>
          </div>

          {/* 处理设置 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">处理设置</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  边缘融合强度
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>柔和</span>
                  <span>适中</span>
                  <span>强烈</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  阴影强度
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="40"
                  className="w-full h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>无阴影</span>
                  <span>自然</span>
                  <span>强烈</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">保持透视关系</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">智能光照匹配</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">批量处理模式</span>
                </label>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={processing}
              onClick={handleProcess}
              disabled={!uploadedFile || !selectedBackground || processed}
            >
              {processing ? '处理中...' : processed ? '处理完成' : '开始处理'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleReset}
              >
                重新开始
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Download className="h-5 w-5" />}
                onClick={handleDownload}
                disabled={!processed}
              >
                下载结果
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 使用技巧 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">使用技巧</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-1">选择合适的背景</h4>
                <p className="text-sm text-blue-700">
                  根据原图的光照和色调选择匹配的背景，效果更自然。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">调整边缘融合</h4>
                <p className="text-sm text-blue-700">
                  对于复杂边缘（如头发），适当增加融合强度可以获得更好效果。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">使用AI推荐</h4>
                <p className="text-sm text-blue-700">
                  AI智能推荐基于图片内容分析，通常能提供最佳匹配背景。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundReplacePage