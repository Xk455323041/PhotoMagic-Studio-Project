import React, { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon, File, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  acceptedFormats?: string[]
  maxSize?: number
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 20 * 1024 * 1024, // 20MB
  className,
}) => {
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setIsDragging(false)
      setError('')

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0].code === 'file-too-large') {
          setError(`文件太大，最大支持 ${maxSize / 1024 / 1024}MB`)
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError('不支持的文件格式')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        console.log('[FileUpload] accepted file:', {
          name: file?.name,
          size: file?.size,
          type: file?.type,
          lastModified: file?.lastModified,
          isFileInstance: file instanceof File,
        })
        onFileUpload(file)
        setUploadSuccess(true)
        
        // 显示成功提示
        toast.success(`"${file.name}" 上传成功`, {
          duration: 3000,
          icon: '✅',
        })
        
        // 3秒后重置成功状态
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      }
    },
    [onFileUpload, maxSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize,
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  const formatAcceptString = () => {
    const extensions = acceptedFormats.flatMap(format => {
      if (format === 'image/jpeg') return ['.jpg', '.jpeg']
      if (format === 'image/png') return ['.png']
      if (format === 'image/webp') return ['.webp']
      return []
    })
    return extensions.join(', ')
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200',
          'hover:border-brand-400 hover:bg-brand-50',
          isDragActive && 'border-brand-500 bg-brand-50',
          error && 'border-red-300 bg-red-50',
          isDragging && 'scale-[1.02]'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div
            className={cn(
              'mb-4 flex h-20 w-20 items-center justify-center rounded-full transition-colors',
              isDragActive ? 'bg-brand-100' : 'bg-gray-100',
              error && 'bg-red-100'
            )}
          >
            {uploadSuccess ? (
              <CheckCircle className="h-8 w-8 animate-pulse text-green-600" />
            ) : isDragActive ? (
              <Upload className="h-8 w-8 animate-bounce text-brand-600" />
            ) : error ? (
              <X className="h-8 w-8 text-red-600" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-brand-500" />
            )}
          </div>

          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900">
              {uploadSuccess
                ? '上传成功'
                : isDragActive
                ? '松开鼠标上传文件'
                : error
                ? '上传失败'
                : '拖放文件到这里'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {uploadSuccess
                ? '文件已准备就绪'
                : isDragActive
                ? '将文件拖放到此区域'
                : error
                ? error
                : '或点击选择文件'}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <File className="h-3 w-3" />
            <span>支持 {formatAcceptString()}</span>
            <span className="text-gray-400">•</span>
            <span>最大 {maxSize / 1024 / 1024}MB</span>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-700">1</span>
            </div>
            <span className="text-sm font-medium text-gray-900">选择图片</span>
          </div>
          <p className="text-xs text-gray-600">拖放或点击选择文件</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-700">2</span>
            </div>
            <span className="text-sm font-medium text-gray-900">AI处理</span>
          </div>
          <p className="text-xs text-gray-600">AI自动分析并移除背景</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-700">3</span>
            </div>
            <span className="text-sm font-medium text-gray-900">下载结果</span>
          </div>
          <p className="text-xs text-gray-600">下载透明背景的PNG图片</p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload