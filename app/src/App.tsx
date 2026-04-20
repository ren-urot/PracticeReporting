import { Routes, Route, Navigate } from 'react-router-dom'
import PracticeReportingPage from './pages/PracticeReportingPage'
import StudentDetailPage from './pages/StudentDetailPage'
import SettingsPage from './pages/SettingsPage'
import AccountPage from './pages/AccountPage'
import ManualUploadPage from './pages/ManualUploadPage'
import BulkUploadPage from './pages/BulkUploadPage'
import CpdPlanPage from './pages/CpdPlanPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/account" replace />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/practice-reporting" element={<PracticeReportingPage />} />
      <Route path="/student/:id" element={<StudentDetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/manual-upload" element={<ManualUploadPage />} />
      <Route path="/bulk-upload" element={<BulkUploadPage />} />
      <Route path="/cpd-plan" element={<CpdPlanPage />} />
    </Routes>
  )
}
