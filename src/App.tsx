import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteLayout } from './components/SiteLayout'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { SpeciesAtlasPage } from './pages/SpeciesAtlasPage'
import { SpeciesRecordsPage } from './pages/SpeciesRecordsPage'
import { TeamContactPage } from './pages/TeamContactPage'

function App() {
  return (
    <BrowserRouter basename="/tsinghua-dyqy/">
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/species-atlas" element={<SpeciesAtlasPage />} />
          <Route path="/data-platform" element={<SpeciesRecordsPage />} />
          <Route path="/showcase" element={<ReportsPage />} />
          <Route path="/team" element={<TeamContactPage />} />
          <Route path="/about" element={<Navigate to="/team" replace />} />
          <Route path="/contact" element={<Navigate to="/team" replace />} />
          <Route path="/species-records" element={<Navigate to="/data-platform" replace />} />
          <Route path="/reports" element={<Navigate to="/showcase" replace />} />
          <Route path="/journey" element={<Navigate to="/showcase" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
