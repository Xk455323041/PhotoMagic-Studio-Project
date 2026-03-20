import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    // 可以在这里添加错误上报逻辑
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-gray-900">出错了</h2>
            <p className="mb-6 text-gray-600">
              抱歉，页面加载时出现了问题。请稍后重试，或联系技术支持。
            </p>
            
            {this.state.error && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
                <p className="mb-2 text-sm font-medium text-gray-700">错误信息：</p>
                <code className="text-xs text-gray-600">
                  {this.state.error.message || '未知错误'}
                </code>
              </div>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="primary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleRetry}
              >
                重试
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary