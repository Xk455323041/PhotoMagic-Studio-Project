import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import BackgroundRemovalPage from '@/pages/BackgroundRemovalPage'
import IdPhotoPage from '@/pages/IdPhotoPage'
import BackgroundReplacePage from '@/pages/BackgroundReplacePage'
import PhotoRestorationPage from '@/pages/PhotoRestorationPage'

const SimpleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/background-removal" element={<BackgroundRemovalPage />} />
      <Route path="/id-photo" element={<IdPhotoPage />} />
      <Route path="/background-replace" element={<BackgroundReplacePage />} />
      <Route path="/photo-restoration" element={<PhotoRestorationPage />} />
    </Routes>
  )
}

export default SimpleRoutes