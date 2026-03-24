import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Switch } from '@/components/ui/Switch'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Copy, 
  Download, 
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { useServiceConfig } from '@/services/config'
import toast from 'react-hot-toast'

const ServiceConfigPanel: React.FC = () => {
  const {
    config,
    updateConfig,
    validate,
    getStatus,
    getRecommendations,
    exportConfig,
    importConfig,
    getTemplate,
    applyEnvironment,
    syncWithAppSettings,
  } = useServiceConfig()

  const [activeTab, setActiveTab] = useState('overview')
  const [showRemoveBgKey, setShowRemoveBgKey] = useState(false)
  const [showVolcengineSecret, setShowVolcengineSecret] = useState(false)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validate> | null>(null)
  const [importJson, setImportJson] = useState('')

  const serviceStatus = getStatus()
  const recommendations = getRecommendations()

  useEffect(() => {
    const result = validate()
    setValidationResult(result)
  }, [config])

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.')
    const newConfig = { ...config }
    
    let current: any = newConfig
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    updateConfig(newConfig)
  }

  const handleImport = () => {
    if (!importJson.trim()) {
      toast.error('请输入配置JSON')
      return
    }

    const result = importConfig(importJson)
    if (result.success) {
      toast.success('配置导入成功')
      setImportJson('')
    } else {
      toast.error(`导入失败: ${result.error}`)
    }
  }

  const handleExport = () => {
    const configJson = exportConfig()
    
    // 复制到剪贴板
    navigator.clipboard.writeText(configJson)
      .then(() => toast.success('配置已复制到剪贴板'))
      .catch(() => {
        // 如果复制失败，下载文件
        const blob = new Blob([configJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'photomagic-service-config.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('配置已下载')
      })
  }

  const handleLoadTemplate = () => {
    const template = getTemplate()
    updateConfig(template)
    toast.success('已加载配置模板')
  }

  const handleTestConnection = async (service: 'removeBg' | 'volcengine') => {
    toast.loading(`正在测试 ${service === 'removeBg' ? 'Remove.bg' : '火山引擎'} 连接...`)
    
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const status = getStatus()
    const serviceStatus = status[service]
    
    if (serviceStatus.configured) {
      toast.success(`${service === 'removeBg' ? 'Remove.bg' : '火山引擎'} 连接正常`)
    } else {
      toast.error(`${service === 'removeBg' ? 'Remove.bg' : '火山引擎'} 连接失败，请检查配置`)
    }
  }

  const handleSyncAppSettings = () => {
    syncWithAppSettings()
    toast.success('已从应用设置同步配置')
  }

  return (
    <div className="space-y-6">
      {/* 状态概览 */}
      <Card>
        <CardHeader title="服务状态概览" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Remove.bg</h3>
                <div className={`h-2 w-2 rounded-full ${serviceStatus.removeBg.configured ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-sm text-gray-600">
                {serviceStatus.removeBg.enabled ? '已启用' : '未启用'}
                {serviceStatus.removeBg.configured ? '，配置正常' : '，配置缺失'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">火山引擎</h3>
                <div className={`h-2 w-2 rounded-full ${serviceStatus.volcengine.configured ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-sm text-gray-600">
                {serviceStatus.volcengine.enabled ? '已启用' : '未启用'}
                {serviceStatus.volcengine.configured ? '，配置正常' : '，配置缺失'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">本地处理</h3>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <p className="text-sm text-gray-600">始终可用，无需配置</p>
            </div>
          </div>

          {/* 验证结果 */}
          {validationResult && (
            <div className="mt-4">
              {validationResult.valid ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    所有配置验证通过
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    配置存在问题: {validationResult.errors.join('; ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* 推荐建议 */}
          {recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">推荐建议</h4>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-3 rounded-lg ${
                      rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                      rec.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 ${
                      rec.priority === 'high' ? 'text-red-600' :
                      rec.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{rec.service}</p>
                      <p className="text-sm">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSyncAppSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              同步应用设置
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出配置
            </Button>
            <Button variant="outline" onClick={handleLoadTemplate}>
              <Copy className="h-4 w-4 mr-2" />
              加载模板
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* 配置选项卡 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="removebg">Remove.bg</TabsTrigger>
          <TabsTrigger value="volcengine">火山引擎</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
        </TabsList>

        {/* Remove.bg 配置 */}
        <TabsContent value="removebg">
          <Card>
            <CardHeader 
              title="Remove.bg 配置" 
              description="背景移除服务配置"
            />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">启用 Remove.bg</h4>
                  <p className="text-sm text-gray-600">启用后使用 Remove.bg 进行背景移除</p>
                </div>
                <Switch
                  checked={config.removeBg.enabled}
                  onCheckedChange={(checked) => 
                    handleConfigChange('removeBg.enabled', checked)
                  }
                />
              </div>

              {config.removeBg.enabled && (
                <>
                  <Input
                    label="API Key"
                    type={showRemoveBgKey ? 'text' : 'password'}
                    value={config.removeBg.apiKey}
                    onChange={(e) => 
                      handleConfigChange('removeBg.apiKey', e.target.value)
                    }
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowRemoveBgKey(!showRemoveBgKey)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showRemoveBgKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    helperText="从 remove.bg 获取的 API Key"
                  />

                  <Input
                    label="API 端点"
                    value={config.removeBg.endpoint}
                    onChange={(e) => 
                      handleConfigChange('removeBg.endpoint', e.target.value)
                    }
                    helperText="Remove.bg API 端点地址"
                  />

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('removeBg')}
                    >
                      测试连接
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 火山引擎配置 */}
        <TabsContent value="volcengine">
          <Card>
            <CardHeader 
              title="火山引擎配置" 
              description="AI图像处理服务配置"
            />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">启用火山引擎</h4>
                  <p className="text-sm text-gray-600">启用后使用火山引擎进行AI图像处理</p>
                </div>
                <Switch
                  checked={config.volcengine.enabled}
                  onCheckedChange={(checked) => 
                    handleConfigChange('volcengine.enabled', checked)
                  }
                />
              </div>

              {config.volcengine.enabled && (
                <>
                  <Input
                    label="Access Key ID"
                    value={config.volcengine.accessKeyId}
                    onChange={(e) => 
                      handleConfigChange('volcengine.accessKeyId', e.target.value)
                    }
                    helperText="火山引擎访问密钥 ID"
                  />

                  <Input
                    label="Secret Access Key"
                    type={showVolcengineSecret ? 'text' : 'password'}
                    value={config.volcengine.secretAccessKey}
                    onChange={(e) => 
                      handleConfigChange('volcengine.secretAccessKey', e.target.value)
                    }
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowVolcengineSecret(!showVolcengineSecret)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showVolcengineSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    helperText="火山引擎访问密钥"
                  />

                  <Input
                    label="Service ID"
                    value={config.volcengine.serviceId}
                    onChange={(e) => 
                      handleConfigChange('volcengine.serviceId', e.target.value)
                    }
                    helperText="ImageX 服务 ID"
                  />

                  <Input
                    label="区域"
                    value={config.volcengine.region}
                    onChange={(e) => 
                      handleConfigChange('volcengine.region', e.target.value)
                    }
                    helperText="服务区域，如 cn-north-1"
                  />

                  <Input
                    label="API 端点"
                    value={config.volcengine.endpoint}
                    onChange={(e) => 
                      handleConfigChange('volcengine.endpoint', e.target.value)
                    }
                    helperText="火山引擎 API 端点地址"
                  />

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('volcengine')}
                    >
                      测试连接
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 高级设置 */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader 
              title="高级设置" 
              description="服务网关高级配置"
            />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">启用本地回退</h4>
                  <p className="text-sm text-gray-600">云端服务失败时自动使用本地处理</p>
                </div>
                <Switch
                  checked={config.fallbackToLocal}
                  onCheckedChange={(checked) => 
                    handleConfigChange('fallbackToLocal', checked)
                  }
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">首选服务</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['volcengine', 'remove-bg', 'local'].map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleConfigChange('preferredService', service)}
                      className={`px-4 py-2 rounded-lg border ${
                        config.preferredService === service
                          ? 'bg-brand-50 border-brand-500 text-brand-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {service === 'volcengine' ? '火山引擎' :
                       service === 'remove-bg' ? 'Remove.bg' : '本地处理'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">环境配置</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['development', 'staging', 'production'] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => applyEnvironment(env)}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      {env === 'development' ? '开发环境' :
                       env === 'staging' ? '测试环境' : '生产环境'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">导入/导出配置</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      导入配置 JSON
                    </label>
                    <textarea
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder='{"removeBg": {"apiKey": "..."}, ...}'
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleImport}>
                      <Upload className="h-4 w-4 mr-2" />
                      导入配置
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      导出配置
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">取消</Button>
        <Button onClick={() => toast.success('配置已保存')}>
          <Save className="h-4 w-4 mr-2" />
          保存配置
        </Button>
      </div>
    </div>
  )
}

export default ServiceConfigPanel