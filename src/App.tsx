import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminEntryPage from './pages/AdminEntryPage'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ArticlesPage from './pages/ArticlesPage'
import BuildsPage from './pages/BuildsPage'
import ContactPage from './pages/ContactPage'
import EventsPage from './pages/EventsPage'
import GalleryPage from './pages/GalleryPage'
import HomePage from './pages/HomePage'
import MeetupsPage from './pages/MeetupsPage'
import NetworkPage from './pages/NetworkPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/meetups" element={<MeetupsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/builds" element={<BuildsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/*" element={<AdminEntryPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
