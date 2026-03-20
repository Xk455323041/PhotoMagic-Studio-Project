import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/layouts/Layout'
import HomePage from '@/pages/HomePage'
import BackgroundRemovalPage from '@/pages/BackgroundRemovalPage'
import IdPhotoPage from '@/pages/IdPhotoPage'
import BackgroundReplacePage from '@/pages/BackgroundReplacePage'
import PhotoRestorationPage from '@/pages/PhotoRestorationPage'
import TutorialsPage from '@/pages/TutorialsPage'
import SettingsPage from '@/pages/SettingsPage'
import HelpPage from '@/pages/HelpPage'
import NotFoundPage from '@/pages/NotFoundPage'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="background-removal" element={<BackgroundRemovalPage />} />
        <Route path="id-photo" element={<IdPhotoPage />} />
        <Route path="background-replace" element={<BackgroundReplacePage />} />
        <Route path="photo-restoration" element={<PhotoRestorationPage />} />
        <Route path="tutorials" element={<TutorialsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes