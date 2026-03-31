import React, { useState } from 'react'
import { Camera, Ruler, Palette, Download, Printer, Globe, CheckCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import FileUpload from '@/components/upload/FileUpload'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'

const isBrowserFile = (value: unknown): value is File => {
  if (!value || typeof value !== 'object') return false

  const fileCtor = (globalThis as any)?.File
  if (typeof fileCtor === 'function') {
    try {
      return value instanceof fileCtor
    } catch {
      // fall through to duck-typing
    }
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.type === 'string' &&
    typeof candidate.arrayBuffer === 'function' &&
    typeof candidate.slice === 'function'
  )
}

const IdPhotoPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('china')
  const [selectedSize, setSelectedSize] = useState('1inch')
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6')
  const [processing, setProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState<{ url: string; filename: string } | null>(null)

  // 国家证件照规格
  const countrySpecs = {
    china: {
      name: '中国',
      sizes: [
        { id: '1inch', name: '一寸', dimensions: '25mm × 35mm', dpi: 300 },
        { id: '2inch', name: '二寸', dimensions: '35mm × 49mm', dpi: 300 },
        { id: 'small2inch', name: '小二寸', dimensions: '35mm × 45mm', dpi: 300 },
      ],
    },
    usa: {
      name: '美国',
      sizes: [
        { id: '2x2', name: '2x2英寸', dimensions: '51mm × 51mm', dpi: 300 },
        { id: 'passport', name: '护照照片', dimensions: '51mm × 51mm', dpi: 300 },
      ],
    },
    eu: {
      name: '欧盟',
      sizes: [
        { id: 'eu-passport', name: '护照照片', dimensions: '35mm × 45mm', dpi: 300 },
        { id: 'eu-visa', name: '签证照片', dimensions: '35mm × 45mm', dpi: 300 },
      ],
    },
    japan: {
      name: '日本',
      sizes: [
        { id: 'jp-passport', name: '护照照片', dimensions: '45mm × 45mm', dpi: 300 },
        { id: 'jp-visa', name: '签证照片', dimensions: '45mm × 45mm', dpi: 300 },
      ],
    },
  }

  // 背景颜色选项
  const backgroundColors = [
    { name: '蓝色', value: '#3b82f6', class: 'bg-blue-600' },
    { name: '红色', value: '#ef4444', class: 'bg-red-600' },
    { name: '白色', value: '#ffffff', class: 'bg-white border' },
    { name: '灰色', value: '#6b7280', class: 'bg-gray-600' },
    { name: '自定义', value: 'custom', class: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  ]

  const handleFileUpload = (file: File) => {
    console.log('[IdPhotoPage] selected file:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      isFileInstance: isBrowserFile(file),
    })
    setUploadedFile(file)
  }

  const handleProcess = async () => {
    if (!uploadedFile) {
      toast.error('请先上传照片')
      return
    }

    console.log('[IdPhotoPage] uploading file before process:', {
      name: uploadedFile?.name,
      size: uploadedFile?.size,
      type: uploadedFile?.type,
      isFileInstance: isBrowserFile(uploadedFile),
    })
    
    setProcessing(true)
    setProcessedResult(null)
    
    try {
      // 1. 上传文件
      toast.loading('正在上传照片...')
      const uploadResult = await apiService.uploadFile(
        uploadedFile,
        'id_photo',
        '证件照处理'
      )
      toast.dismiss()
      toast.success('照片上传成功')
      
      // 2. 处理证件照
      toast.loading('正在生成证件照...')
      
      // 根据选择的规格构建参数
      const selectedSizeObj = countrySpecs[selectedCountry as keyof typeof countrySpecs]
        .sizes.find(s => s.id === selectedSize)
      
      const params = {
        photo_type: 'id_card',
        background: {
          type: 'solid',
          color: backgroundColor
        },
        size: {
          type: selectedSizeObj?.name.includes('寸') ? 'custom' : 'standard',
          dpi: selectedSizeObj?.dpi || 300
        },
        portrait: {
          position: 'center',
          zoom: 1,
          beauty: {
            enabled: true,
            skin_smooth: 70,
            eye_brighten: 60,
            teeth_whiten: 50
          }
        },
        output: {
          format: 'png',
          quality: 95,
          layout: 'single'
        }
      }
      
      const result = await apiService.idPhotoProcessing(uploadResult.file_id, params)
      toast.dismiss()
      toast.success('证件照生成成功')
      
      // 3. 保存处理结果
      setProcessedResult({
        url: result.url,
        filename: `证件照_${Date.now()}.png`
      })
      
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || '处理失败，请重试')
      console.error('证件照处理失败:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handlePrintLayout = () => {
    toast.success('打印布局功能开发中...')
  }

  const handleDownload = () => {
    if (!processedResult) {
      toast.error('请先生成证件照')
      return
    }
    
    try {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = processedResult.url
      link.download = processedResult.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('下载开始')
    } catch (error) {
      toast.error('下载失败，请重试')
      console.error('下载失败:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">证件照制作</h1>
        </div>
        <p className="text-lg text-gray-600">
          专业证件照制作工具，支持各国标准规格，一键生成打印版。
        </p>
      </div>

      {/* 主要工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：上传和编辑 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 上传区域 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">上传照片</h2>
              <p className="text-sm text-gray-600">
                请上传正面免冠照片，建议使用专业拍摄的照片
              </p>
            </div>
            
            <FileUpload
              onFileUpload={handleFileUpload}
              acceptedFormats={['image/jpeg', 'image/png']}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          {/* 编辑工具 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">编辑工具</h2>
              <p className="text-sm text-gray-600">
                调整照片以满足证件照要求
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 裁剪工具 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">裁剪与调整</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">头部比例</span>
                    <span className="text-sm font-medium text-gray-900">70%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    defaultValue="70"
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">肩膀对齐</span>
                    <span className="text-sm font-medium text-gray-900">水平</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">自动对齐</Button>
                    <Button size="sm" variant="outline" className="flex-1">手动调整</Button>
                  </div>
                </div>
              </div>

              {/* 背景颜色 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">背景颜色</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBackgroundColor(color.value)}
                      className={`
                        h-10 rounded-lg border-2 transition-all
                        ${backgroundColor === color.value ? 'border-gray-900' : 'border-transparent'}
                      `}
                    >
                      <div className={`h-full w-full rounded ${color.class}`} />
                    </button>
                  ))}
                </div>
                {backgroundColor === 'custom' && (
                  <div className="mt-2">
                    <input
                      type="color"
                      value="#3b82f6"
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-8 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 图像调整 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">图像调整</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: '亮度', value: 50 },
                    { label: '对比度', value: 60 },
                    { label: '饱和度', value: 55 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={item.value}
                        className="w-full h-2 bg-gray-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 美化工具 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">美化工具</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: '皮肤平滑', checked: true },
                    { label: '去除红眼', checked: true },
                    { label: '牙齿美白', checked: false },
                    { label: '去除瑕疵', checked: true },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：规格选择和预览 */}
        <div className="space-y-6">
          {/* 国家选择 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">选择国家/地区</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(countrySpecs).map(([key, country]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCountry(key)}
                  className={`
                    rounded-lg border p-4 text-center transition-all
                    ${selectedCountry === key
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="text-lg font-medium text-gray-900 mb-1">
                    {country.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {country.sizes.length} 种规格
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 尺寸选择 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">选择尺寸</h3>
            
            <div className="space-y-3">
              {countrySpecs[selectedCountry as keyof typeof countrySpecs].sizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size.id)}
                  className={`
                    w-full rounded-lg border p-4 text-left transition-all
                    ${selectedSize === size.id
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.dimensions}</div>
                    </div>
                    {selectedSize === size.id && (
                      <CheckCircle className="h-5 w-5 text-brand-600" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    DPI: {size.dpi} • 适合: {size.name.includes('寸') ? '国内使用' : '国际使用'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 预览区域 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">预览</h3>
            
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mb-4 overflow-hidden">
              {processedResult ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">证件照已生成</p>
                    <p className="text-sm text-gray-600">点击下方按钮下载</p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900">照片已上传</p>
                  <p className="text-sm text-gray-600">准备进行处理</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900">上传照片预览</p>
                  <p className="text-sm text-gray-600">支持 JPG、PNG 格式</p>
                </div>
              )}
            </div>

            {/* 规格信息 */}
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">当前规格:</span>
                <span className="font-medium text-gray-900">
                  {countrySpecs[selectedCountry as keyof typeof countrySpecs].name} - {
                    countrySpecs[selectedCountry as keyof typeof countrySpecs].sizes
                      .find(s => s.id === selectedSize)?.name
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">尺寸:</span>
                <span className="font-medium text-gray-900">
                  {countrySpecs[selectedCountry as keyof typeof countrySpecs].sizes
                    .find(s => s.id === selectedSize)?.dimensions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">DPI:</span>
                <span className="font-medium text-gray-900">
                  {countrySpecs[selectedCountry as keyof typeof countrySpecs].sizes
                    .find(s => s.id === selectedSize)?.dpi}
                </span>
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
              disabled={!uploadedFile}
            >
              {processing ? '处理中...' : '生成证件照'}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Printer className="h-5 w-5" />}
                onClick={handlePrintLayout}
                disabled={!uploadedFile}
              >
                打印布局
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Download className="h-5 w-5" />}
                onClick={handleDownload}
                disabled={!processedResult}
              >
                下载图片
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 打印布局选项 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">打印布局选项</h2>
          <p className="text-sm text-gray-600">
            选择适合您打印需求的布局方式
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '标准布局',
              description: '6张/页，适合普通A4纸',
              price: '免费',
              features: ['6张照片/页', '标准边距', 'A4尺寸', '适合家庭打印'],
            },
            {
              title: '专业布局',
              description: '9张/页，节省纸张',
              price: '免费',
              features: ['9张照片/页', '优化边距', '出血线标记', '适合批量打印'],
            },
            {
              title: '自定义布局',
              description: '完全自定义布局',
              price: '高级功能',
              features: ['自定义数量', '任意排列', '添加文字', '专业模板'],
            },
          ].map((option, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 hover:border-brand-300 transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{option.price}</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                variant={index === 1 ? 'primary' : 'outline'}
                fullWidth
              >
                选择此布局
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IdPhotoPage