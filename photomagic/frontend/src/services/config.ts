/**
 * 服务配置管理
 */

import { ServiceConfig, defaultServiceConfig } from './serviceGateway'
import { useSettingsStore } from '@/stores/settingsStore'

export class ServiceConfigManager {
  private static instance: ServiceConfigManager
  private config: ServiceConfig

  private constructor() {
    // 从本地存储加载配置
    this.config = this.loadConfig()
  }

  static getInstance(): ServiceConfigManager {
    if (!ServiceConfigManager.instance) {
      ServiceConfigManager.instance = new ServiceConfigManager()
    }
    return ServiceConfigManager.instance
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig(): ServiceConfig {
    try {
      const stored = localStorage.getItem('photomagic-service-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...defaultServiceConfig, ...parsed }
      }
    } catch (error) {
      console.error('加载服务配置失败:', error)
    }
    
    return { ...defaultServiceConfig }
  }

  /**
   * 保存配置到本地存储
   */
  private saveConfig(config: ServiceConfig): void {
    try {
      localStorage.setItem('photomagic-service-config', JSON.stringify(config))
    } catch (error) {
      console.error('保存服务配置失败:', error)
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ServiceConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig(this.config)
    
    // 通知配置更新
    this.notifyConfigChange()
  }

  /**
   * 重置配置
   */
  resetConfig(): void {
    this.config = { ...defaultServiceConfig }
    this.saveConfig(this.config)
    this.notifyConfigChange()
  }

  /**
   * 配置变更通知
   */
  private notifyConfigChange(): void {
    // 可以在这里添加事件通知逻辑
    console.log('服务配置已更新:', this.config)
  }

  /**
   * 验证配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证 Remove.bg 配置
    if (this.config.removeBg.enabled) {
      if (!this.config.removeBg.apiKey) {
        errors.push('Remove.bg API Key 不能为空')
      }
      
      if (!this.config.removeBg.endpoint) {
        errors.push('Remove.bg 端点不能为空')
      }
    }

    // 验证火山引擎配置
    if (this.config.volcengine.enabled) {
      if (!this.config.volcengine.accessKeyId) {
        errors.push('火山引擎 Access Key ID 不能为空')
      }
      
      if (!this.config.volcengine.secretAccessKey) {
        errors.push('火山引擎 Secret Access Key 不能为空')
      }
      
      if (!this.config.volcengine.serviceId) {
        errors.push('火山引擎 Service ID 不能为空')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 获取服务状态
   */
  getServiceStatus(): {
    removeBg: { enabled: boolean; configured: boolean }
    volcengine: { enabled: boolean; configured: boolean }
    local: { enabled: boolean }
  } {
    const validation = this.validateConfig()

    return {
      removeBg: {
        enabled: this.config.removeBg.enabled,
        configured: this.config.removeBg.enabled && 
                   !!this.config.removeBg.apiKey && 
                   !!this.config.removeBg.endpoint,
      },
      volcengine: {
        enabled: this.config.volcengine.enabled,
        configured: this.config.volcengine.enabled && 
                   !!this.config.volcengine.accessKeyId && 
                   !!this.config.volcengine.secretAccessKey && 
                   !!this.config.volcengine.serviceId,
      },
      local: {
        enabled: true, // 本地处理始终可用
      },
    }
  }

  /**
   * 获取推荐的服务配置提示
   */
  getRecommendations(): Array<{
    service: string
    message: string
    priority: 'high' | 'medium' | 'low'
  }> {
    const recommendations: Array<{
      service: string
      message: string
      priority: 'high' | 'medium' | 'low'
    }> = []

    const status = this.getServiceStatus()

    // Remove.bg 推荐
    if (status.removeBg.enabled && !status.removeBg.configured) {
      recommendations.push({
        service: 'Remove.bg',
        message: 'Remove.bg 已启用但未配置，背景移除功能将不可用',
        priority: 'high',
      })
    }

    // 火山引擎推荐
    if (status.volcengine.enabled && !status.volcengine.configured) {
      recommendations.push({
        service: '火山引擎',
        message: '火山引擎已启用但未配置，AI增强功能将不可用',
        priority: 'high',
      })
    }

    // 服务启用推荐
    if (!status.removeBg.enabled) {
      recommendations.push({
        service: 'Remove.bg',
        message: '建议启用 Remove.bg 以获得更好的背景移除效果',
        priority: 'medium',
      })
    }

    if (!status.volcengine.enabled) {
      recommendations.push({
        service: '火山引擎',
        message: '建议启用火山引擎以获得AI图像增强功能',
        priority: 'medium',
      })
    }

    return recommendations
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 导入配置
   */
  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(configJson)
      
      // 验证导入的配置结构
      if (typeof imported !== 'object' || imported === null) {
        return { success: false, error: '配置格式无效' }
      }

      // 合并配置
      this.config = { ...defaultServiceConfig, ...imported }
      this.saveConfig(this.config)
      this.notifyConfigChange()

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '导入配置失败' 
      }
    }
  }

  /**
   * 获取配置模板
   */
  getConfigTemplate(): ServiceConfig {
    return {
      removeBg: {
        apiKey: 'your_remove_bg_api_key_here',
        endpoint: 'https://api.remove.bg/v1.0',
        enabled: true,
      },
      volcengine: {
        accessKeyId: 'your_volcengine_access_key_id',
        secretAccessKey: 'your_volcengine_secret_access_key',
        serviceId: 'your_imagex_service_id',
        region: 'cn-north-1',
        endpoint: 'https://imagex.volcengineapi.com',
        enabled: true,
      },
      fallbackToLocal: true,
      preferredService: 'volcengine',
    }
  }

  /**
   * 获取环境特定的配置
   */
  getEnvironmentConfig(env: 'development' | 'staging' | 'production'): Partial<ServiceConfig> {
    const baseConfig = {
      development: {
        removeBg: { enabled: false },
        volcengine: { enabled: false },
        fallbackToLocal: true,
      },
      staging: {
        removeBg: { enabled: true },
        volcengine: { enabled: true },
        fallbackToLocal: true,
      },
      production: {
        removeBg: { enabled: true },
        volcengine: { enabled: true },
        fallbackToLocal: false,
      },
    }

    return baseConfig[env] || {}
  }

  /**
   * 应用环境配置
   */
  applyEnvironment(env: 'development' | 'staging' | 'production'): void {
    const envConfig = this.getEnvironmentConfig(env)
    this.updateConfig(envConfig)
  }
}

// React Hook
export const useServiceConfig = () => {
  const configManager = ServiceConfigManager.getInstance()
  const settings = useSettingsStore()

  // 从应用设置同步配置
  const syncWithAppSettings = () => {
    const apiConfig = settings.apiConfig
    
    // 如果应用设置中有API配置，同步到服务配置
    if (apiConfig.apiKey) {
      configManager.updateConfig({
        removeBg: {
          ...configManager.getConfig().removeBg,
          apiKey: apiConfig.apiKey,
        },
      })
    }
  }

  return {
    config: configManager.getConfig(),
    updateConfig: configManager.updateConfig.bind(configManager),
    resetConfig: configManager.resetConfig.bind(configManager),
    validate: configManager.validateConfig.bind(configManager),
    getStatus: configManager.getServiceStatus.bind(configManager),
    getRecommendations: configManager.getRecommendations.bind(configManager),
    exportConfig: configManager.exportConfig.bind(configManager),
    importConfig: configManager.importConfig.bind(configManager),
    getTemplate: configManager.getConfigTemplate.bind(configManager),
    applyEnvironment: configManager.applyEnvironment.bind(configManager),
    syncWithAppSettings,
  }
}

// 默认导出
export default ServiceConfigManager