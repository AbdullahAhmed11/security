import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { AppShell } from './components/layout/AppShell'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import PersonnelList from './pages/personnel/PersonnelList'
import PersonnelDetail from './pages/personnel/PersonnelDetail'
import LeavesPage from './pages/LeavesPage'
import DutiesPage from './pages/DutiesPage'
import ExcellencePage from './pages/ExcellencePage'
import ArchivePage from './pages/ArchivePage'
import SearchPage from './pages/SearchPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/personnel" element={<PersonnelList />} />
            <Route path="/personnel/:id" element={<PersonnelDetail />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/duties" element={<DutiesPage />} />
            <Route path="/excellence" element={<ExcellencePage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </DataProvider>
  )
}
