import React, { useState } from 'react'
import { Clock, Sparkles, Eye, Zap, Download, RotateCcw, Settings, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import FileUpload from '@/components/upload/FileUpload'

const PhotoRestorationPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [restorationMode, setRestorationMode] = useState('auto')
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])

  // 老照片常见问题
  const commonIssues = [
    { id: 'scratches', name: '划痕', icon: '➖', description: '去除表面划痕' },
    { id: 'stains', name: '污渍', icon: '💧', description: '清除污渍斑点' },
    { id: 'folds', name: '折痕', icon: '📄', description: '修复折痕痕迹' },
    { id: 'fading', name: '褪色', icon: '🎨', description: '恢复原始色彩' },
    { id: 'noise', name: '噪点', icon: '🔊', description: '降噪和去颗粒' },
    { id: 'blur', name: '模糊', icon: '👁️', description: '增强清晰度' },
    { id: 'damage', name: '破损', icon: '🔧', description: '修复破损区域' },
    { id: 'colorize', name: '上色', icon: '🌈', description: '黑白照片上色' },
  ]

  // 修复模式
  const restorationModes = [
    {
      id: 'auto',
      name: '自动修复',
      description: 'AI自动检测并修复所有问题',
      time: '快速',
      quality: '优秀',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: 'manual',
      name: '手动修复',
      description: '手动选择需要修复的问题',
      time: '中等',
      quality: '最佳',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: 'professional',
      name: '专业修复',
      description: '高级算法深度修复',
      time: '较慢',
      quality: '卓越',
      icon: <Eye className="h-5 w-5" />,
    },
  ]

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setProcessed(false)
    setSelectedIssues([])
  }

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    )
  }

  const handleProcess = () => {
    if (!uploadedFile) return
    
    setProcessing(true)
    // 模拟处理过程
    setTimeout(() => {
      setProcessing(false)
      setProcessed(true)
    }, 3500)
  }

  const handleDownload = () => {
    alert('开始下载修复后的照片')
  }

  const handleReset = () => {
    setUploadedFile(null)
    setProcessed(false)
    setSelectedIssues([])
  }

  // 模拟修复前后的对比数据
  const restorationResults = [
    { metric: '清晰度', before: 45, after: 92, unit: '%' },
    { metric: '色彩还原', before: 38, after: 88, unit: '%' },
    { metric: '细节保留', before: 52, after: 95, unit: '%' },
    { metric: '整体质量', before: 40, after: 90, unit: '%' },
  ]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">老照片修复</h1>
        </div>
        <p className="text-lg text-gray-600">
          AI智能修复老照片，去除折痕、划痕、污渍，恢复色彩和清晰度。
        </p>
      </div>

      {/* 主要工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：上传和问题选择 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 上传区域 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">上传老照片</h2>
              <p className="text-sm text-gray-600">
                支持扫描件或数码照片，最大 30MB
              </p>
            </div>
            
            <FileUpload
              onFileUpload={handleFileUpload}
              acceptedFormats={['image/jpeg', 'image/png', 'image/tiff']}
              maxSize={30 * 1024 * 1024}
            />
          </div>

          {/* 修复模式选择 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">选择修复模式</h2>
              <p className="text-sm text-gray-600">
                根据照片状况选择适合的修复模式
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {restorationModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setRestorationMode(mode.id)}
                  className={`
                    rounded-xl border p-6 text-left transition-all
                    ${restorationMode === mode.id
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${restorationMode === mode.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mode.name}</h3>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">处理时间:</span>
                      <span className="font-medium text-gray-900">{mode.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">修复质量:</span>
                      <span className="font-medium text-gray-900">{mode.quality}</span>
                    </div>
                  </div>
                  
                  {restorationMode === mode.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                        推荐用于大多数老照片
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 问题选择（手动模式） */}
          {restorationMode === 'manual' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">选择需要修复的问题</h2>
                <p className="text-sm text-gray-600">
                  勾选照片中存在的主要问题
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {commonIssues.map((issue) => {
                  const isSelected = selectedIssues.includes(issue.id)
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => toggleIssue(issue.id)}
                      className={`
                        rounded-lg border p-4 text-center transition-all
                        ${isSelected
                          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`text-2xl mb-2 ${isSelected ? 'scale-110 transition-transform' : ''}`}>
                        {issue.icon}
                      </div>
                      <div className="font-medium text-gray-900 mb-1">
                        {issue.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {issue.description}
                      </div>
                      {isSelected && (
                        <div className="mt-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedIssues.length > 0 && (
                <div className="mt-6 rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">已选择 {selectedIssues.length} 个修复项目</span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">
                    将针对这些问题进行专项修复
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 高级设置 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">高级设置</h2>
              <p className="text-sm text-gray-600">
                调整修复参数以获得最佳效果
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    修复强度
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={restorationMode === 'professional' ? 80 : 60}
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>保守</span>
                    <span>适中</span>
                    <span>激进</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    色彩还原度
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={75}
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>保持原色</span>
                    <span>自然还原</span>
                    <span>增强色彩</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">自动去噪</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={restorationMode !== 'auto'}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">保留原始纹理</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">黑白照片智能上色</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">增强面部细节</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：预览和结果 */}
        <div className="space-y-6">
          {/* 处理状态 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">修复状态</h3>
            
            <div className="space-y-4">
              {!uploadedFile ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900">等待上传照片</p>
                  <p className="text-sm text-gray-600">请先上传需要修复的老照片</p>
                </div>
              ) : processing ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-brand-600 animate-pulse" />
                  </div>
                  <p className="text-gray-900">AI修复中</p>
                  <p className="text-sm text-gray-600">正在智能修复照片...</p>
                  <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              ) : processed ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-900">修复完成</p>
                  <p className="text-sm text-gray-600">照片已成功修复</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-gray-900">准备就绪</p>
                  <p className="text-sm text-gray-600">点击开始修复按钮</p>
                </div>
              )}

              {/* 修复信息 */}
              {uploadedFile && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">照片年代:</span>
                      <span className="font-medium text-gray-900">AI分析中...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">主要问题:</span>
                      <span className="font-medium text-gray-900">
                        {restorationMode === 'auto' ? '自动检测' : `${selectedIssues.length}项`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">预计时间:</span>
                      <span className="font-medium text-gray-900">
                        {restorationMode === 'auto' ? '2-3分钟' : 
                         restorationMode === 'manual' ? '3-5分钟' : '5-8分钟'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 修复效果预览 */}
          {processed && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">修复效果对比</h3>
              
              <div className="space-y-4">
                {restorationResults.map((result, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{result.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 line-through">{result.before}{result.unit}</span>
                        <span className="font-medium text-green-600">→ {result.after}{result.unit}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-gray-400"
                          style={{ width: `${result.before}%` }}
                        />
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500"
                          style={{ width: `${result.after - result.before}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-2 text-green-800">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">修复效果显著</span>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  照片质量平均提升 {Math.round(
                    restorationResults.reduce((sum, r) => sum + (r.after - r.before), 0) / restorationResults.length
                  )}%
                </p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={processing}
              onClick={handleProcess}
              disabled={!uploadedFile || (restorationMode === 'manual' && selectedIssues.length === 0) || processed}
            >
              {processing ? '修复中...' : processed ? '修复完成' : '开始修复'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<RotateCcw className="h-5 w-5" />}
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

          {/* 修复提示 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-2">修复提示</h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• 对于严重破损的照片，建议使用"专业修复"模式</li>
                  <li>• 黑白照片上色需要额外处理时间</li>
                  <li>• 修复过程中请勿关闭页面</li>
                  <li>• 修复完成后建议下载高清版本</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 成功案例展示 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">修复效果展示</h2>
          <p className="text-sm text-gray-600">
            查看其他用户的老照片修复效果
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '家庭合影修复',
              description: '50年代黑白照片，修复划痕和折痕',
              improvement: '清晰度提升85%',
              time: '3分钟',
            },
            {
              title: '个人肖像修复',
              description: '70年代彩色照片，恢复褪色色彩',
              improvement: '色彩还原92%',
              time: '4分钟',
            },
            {
              title: '历史照片修复',
              description: '民国时期照片，修复破损和污渍',
              improvement: '细节保留95%',
              time: '6分钟',
            },
          ].map((caseStudy, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 hover:border-brand-300 transition-colors"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{caseStudy.title}</h3>
                    <p className="text-sm text-gray-600">{caseStudy.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">修复效果:</span>
                  <span className="font-medium text-green-600">{caseStudy.improvement}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">处理时间:</span>
                  <span className="font-medium text-gray-900">{caseStudy.time}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
                  使用{index === 0 ? '自动' : index === 1 ? '手动' : '专业'}修复模式
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PhotoRestorationPage