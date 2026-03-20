import React from 'react'
import { Settings, Zap, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProcessingControlsProps {
  onProcess: () => void
  onReset: () => void
  processing: boolean
  hasFile: boolean
  processed: boolean
}

const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  onProcess,
  onReset,
  processing,
  hasFile,
  processed,
}) => {
  const [edgeSmoothness, setEdgeSmoothness] = React.useState(50)
  const [processingMode, setProcessingMode] = React.useState('auto')
  const [removeShadows, setRemoveShadows] = React.useState(true)

  return (
    <div className="space-y-6">
      {/* 处理模式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          处理模式
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: 'auto', label: '自动模式', description: 'AI智能分析' },
            { id: 'fast', label: '快速模式', description: '速度优先' },
            { id: 'precise', label: '精细模式', description: '质量优先' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setProcessingMode(mode.id)}
              className={`
                rounded-lg border p-4 text-left transition-all
                ${processingMode === mode.id
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{mode.label}</span>
                {processingMode === mode.id && (
                  <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                )}
              </div>
              <p className="text-sm text-gray-600">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 边缘平滑度 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            边缘平滑度
          </label>
          <span className="text-sm font-medium text-brand-600">
            {edgeSmoothness}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={edgeSmoothness}
          onChange={(e) => setEdgeSmoothness(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>粗糙</span>
          <span>适中</span>
          <span>平滑</span>
        </div>
      </div>

      {/* 高级选项 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">高级选项</label>
        
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={removeShadows}
              onChange={(e) => setRemoveShadows(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">移除阴影</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">保持原始尺寸</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked={false}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">批量处理模式</span>
          </label>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={processing ? undefined : <Zap className="h-5 w-5" />}
          loading={processing}
          onClick={onProcess}
          disabled={!hasFile || processed}
        >
          {processing ? '处理中...' : '开始处理'}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<RotateCcw className="h-5 w-5" />}
          onClick={onReset}
        >
          重新开始
        </Button>
      </div>

      {/* 处理提示 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">处理建议</p>
            <p className="mt-1 text-sm text-gray-600">
              {processingMode === 'auto'
                ? 'AI将自动分析图片并选择最佳参数'
                : processingMode === 'fast'
                ? '快速处理适合简单背景的图片'
                : '精细模式适合复杂背景和毛发边缘'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingControls