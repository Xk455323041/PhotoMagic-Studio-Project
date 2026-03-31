import React from 'react'
import { Image as ImageIcon, CheckCircle, XCircle, ZoomIn, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ResultPreviewProps {
  originalFile: File
  onDownload: () => void
  processedFileUrl?: string
  processedFileName?: string
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ 
  originalFile, 
  onDownload,
  processedFileUrl,
  processedFileName = 'processed_image.png'
}) => {
  const [showComparison, setShowComparison] = React.useState(true)
  const [comparisonPosition, setComparisonPosition] = React.useState(50)

  // 模拟处理后的文件信息
  const processedFileInfo = {
    name: originalFile.name.replace(/\.[^/.]+$/, '') + '_processed.png',
    size: Math.round(originalFile.size * 0.8), // 假设处理后的文件小一些
    format: 'PNG',
    dimensions: '1920x1080',
    transparency: true,
  }

  return (
    <div className="space-y-6">
      {/* 对比预览 */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">效果对比</span>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">显示对比</span>
            </label>
          </div>
        </div>

        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          {showComparison ? (
            <>
              {/* 对比滑块 */}
              <div className="absolute inset-0 flex">
                {/* 处理前 */}
                <div
                  className="h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center"
                  style={{ width: `${comparisonPosition}%` }}
                >
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-white/80 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-900">处理前</p>
                  </div>
                </div>
                
                {/* 处理后 */}
                <div
                  className="h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center"
                  style={{ width: `${100 - comparisonPosition}%` }}
                >
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-white/80 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-900">处理后</p>
                  </div>
                </div>
              </div>

              {/* 滑块控制 */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gray-900 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${comparisonPosition}%` }}
                onMouseDown={(e) => {
                  const startX = e.clientX
                  const startPosition = comparisonPosition
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const container = e.currentTarget.parentElement
                    if (!container) return
                    
                    const containerRect = container.getBoundingClientRect()
                    const deltaX = moveEvent.clientX - startX
                    const deltaPercent = (deltaX / containerRect.width) * 100
                    const newPosition = Math.max(0, Math.min(100, startPosition + deltaPercent))
                    setComparisonPosition(newPosition)
                  }
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              >
                <div className="h-8 w-8 rounded-full bg-gray-900 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="text-white text-xs">↔</div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">处理完成</p>
                <p className="text-sm text-gray-600 mt-1">背景已成功移除</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 文件信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">原始文件</p>
              <p className="text-sm text-gray-600">
                {(originalFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">格式:</span>
              <span className="font-medium text-gray-900">
                {originalFile.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">状态:</span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">未处理</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">处理后文件</p>
              <p className="text-sm text-gray-600">
                {(processedFileInfo.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">格式:</span>
              <span className="font-medium text-gray-900">{processedFileInfo.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">透明度:</span>
              <span className="font-medium text-green-700">支持</span>
            </div>
          </div>
        </div>
      </div>

      {/* 质量评估 */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">处理质量评估</h4>
        <div className="space-y-3">
          {[
            { label: '边缘精度', value: 92, color: 'bg-green-500' },
            { label: '细节保留', value: 88, color: 'bg-green-400' },
            { label: '处理速度', value: 95, color: 'bg-blue-500' },
            { label: '整体质量', value: 90, color: 'bg-brand-500' },
          ].map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 下载按钮 */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">下载处理结果</h4>
            <p className="text-sm text-gray-600">
              点击下方按钮下载处理后的图片
            </p>
          </div>
          
          <Button
            variant="primary"
            leftIcon={<Download className="h-5 w-5" />}
            onClick={() => {
              onDownload()
              toast.success('下载开始')
            }}
          >
            下载图片
          </Button>
        </div>
        
        {processedFileUrl && (
          <div className="mt-4 text-sm text-gray-500">
            <p>文件名: <span className="font-medium">{processedFileName}</span></p>
            <p>格式: PNG (透明背景)</p>
            <p>大小: {(processedFileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultPreview