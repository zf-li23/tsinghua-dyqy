import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteLayout } from './components/SiteLayout'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { JourneyPage } from './pages/JourneyPage'
import { ReportsPage } from './pages/ReportsPage'
import { SpeciesRecordsPage } from './pages/SpeciesRecordsPage'

function App() {
  return (
    <BrowserRouter basename="/tsinghua-dyqy/">
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/species-records" element={<SpeciesRecordsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
