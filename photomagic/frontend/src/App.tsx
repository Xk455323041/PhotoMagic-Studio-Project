import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/error/ErrorBoundary'

// 使用新的路由配置
const AppRoutes = lazy(() => import('@/routes/index'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <AppRoutes />
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App