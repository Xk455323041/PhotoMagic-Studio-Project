import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/error/ErrorBoundary'

// 使用简单的路由配置
const SimpleRoutes = lazy(() => import('@/routes/SimpleRoutes'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <SimpleRoutes />
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App