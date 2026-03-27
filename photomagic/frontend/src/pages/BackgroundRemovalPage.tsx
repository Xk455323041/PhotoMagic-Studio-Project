import React, { useState } from 'react'
import { Upload, Scissors, Download, Settings, Zap, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import FileUpload from '@/components/upload/FileUpload'
import ProcessingControls from '@/components/processing/ProcessingControls'
import ResultPreview from '@/components/result/ResultPreview'
import { apiService } from '@/services/api'

const BackgroundRemovalPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [processingTime, setProcessingTime] = useState(0)
  const [processedResult, setProcessedResult] = useState<{ url: string; filename: string; resultId?: string } | null>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setProcessed(false)
  }

  const handleProcess = async () => {
    if (!uploadedFile) return

    setProcessing(true)
    const startTime = Date.now()

    try {
      // 1) 上传文件
      const uploaded = await apiService.uploadFile(uploadedFile, 'background_removal', '背景移除')

      // 2) 调用背景移除
      const result = await apiService.backgroundRemoval(uploaded.fileId || (uploaded as any).file_id, {
        format: 'png',
        bg_color: 'transparent'
      } as any)

      const endTime = Date.now()
      setProcessingTime(endTime - startTime)
      setProcessing(false)
      setProcessed(true)

      const processedFileName = `transparent_${uploadedFile.name.replace(/\.[^/.]+$/, '')}.png`

      // 注意：这里不要直接用 result.url（它可能是 /temp/... 且线上不可访问）
      setProcessedResult({
        url: result.url,
        filename: processedFileName,
        // @ts-expect-error: 为下载保留 result_id
        resultId: (result as any).result_id || (result as any).resultId
      } as any)

    } catch (error: any) {
      console.error('处理失败:', error)
      setProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processedResult) {
      alert('没有可下载的结果')
      return
    }

    try {
      // @ts-expect-error
      const resultId = (processedResult as any).resultId
      if (!resultId) {
        // 兜底：如果没有 resultId，尝试直接下载 url
        const a = document.createElement('a')
        a.href = processedResult.url
        a.download = processedResult.filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        return
      }

      const blob = await apiService.downloadResult(resultId)
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = processedResult.filename
      document.body.appendChild(a)
      a.click()
      a.remove()

      setTimeout(() => URL.revokeObjectURL(url), 2000)

    } catch (e) {
      console.error(e)
      alert('下载失败，请重试')
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setProcessed(false)
    setProcessingTime(0)
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">背景移除</h1>
        </div>
        <p className="text-lg text-gray-600">
          快速移除图片背景，生成透明PNG。支持复杂背景和毛发边缘处理。
        </p>
      </div>

      {/* 主要工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：上传和处理控制 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 上传区域 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">上传图片</h2>
              <p className="text-sm text-gray-600">
                支持 JPG、PNG、WebP 格式，最大 20MB
              </p>
            </div>
            
            <FileUpload
              onFileUpload={handleFileUpload}
              acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              maxSize={20 * 1024 * 1024} // 20MB
            />
            
            {uploadedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            )}
          </div>

          {/* 处理控制 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">处理设置</h2>
              <p className="text-sm text-gray-600">
                调整参数以获得最佳处理效果
              </p>
            </div>
            
            <ProcessingControls
              onProcess={handleProcess}
              onReset={handleReset}
              processing={processing}
              hasFile={!!uploadedFile}
              processed={processed}
            />
          </div>
        </div>

        {/* 右侧：预览和结果 */}
        <div className="space-y-6">
          {/* 处理状态 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">处理状态</h3>
            
            {!uploadedFile && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">请先上传图片</p>
              </div>
            )}
            
            {uploadedFile && !processed && !processing && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Scissors className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-900 font-medium">图片已就绪</p>
                <p className="text-sm text-gray-600 mt-1">点击开始处理按钮</p>
              </div>
            )}
            
            {processing && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-brand-600 animate-pulse" />
                </div>
                <p className="text-gray-900 font-medium">AI正在处理中</p>
                <p className="text-sm text-gray-600 mt-1">请稍候...</p>
              </div>
            )}
            
            {processed && (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium">处理完成</p>
                <p className="text-sm text-gray-600 mt-1">
                  用时 {processingTime}ms
                </p>
              </div>
            )}
          </div>

          {/* 结果预览 */}
          {processed && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">处理结果</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{processingTime}ms</span>
                </div>
              </div>
              
              <ResultPreview
                originalFile={uploadedFile!}
                onDownload={handleDownload}
                processedFileUrl={processedResult?.url}
                processedFileName={processedResult?.filename}
              />
              
              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleDownload}
                >
                  下载透明PNG
                </Button>
              </div>
            </div>
          )}

          {/* 快速提示 */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">快速提示</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>对于复杂背景，建议使用"精细模式"</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>毛发边缘处理需要更高的边缘平滑度</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>处理完成后，可以预览和下载透明背景图片</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 高级功能 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">高级功能</h2>
          <p className="text-sm text-gray-600">
            更多专业工具和选项
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">批量处理</h4>
            <p className="text-sm text-gray-600">同时处理多张图片，提高工作效率</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">智能优化</h4>
            <p className="text-sm text-gray-600">AI自动优化处理参数，获得最佳效果</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">实时预览</h4>
            <p className="text-sm text-gray-600">实时查看处理效果，即时调整参数</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundRemovalPage