import { Routes, Route } from 'react-router-dom'
import Navbar from './shared/components/Navbar'
import Footer from './shared/components/Footer'
import ScrollToTop from './shared/components/ScrollToTop'
import { Toaster } from './shared/components/ui/toaster'

// Pages
import HomePage from './features/properties/pages/HomePage'
import PropertiesPage from './features/properties/pages/PropertiesPage'
import PropertyDetailsPage from './features/properties/pages/PropertyDetailsPage'
import ContactPage from './features/contact/pages/ContactPage'
import AboutPage from './features/about/pages/AboutPage'
import ServicesPage from './features/services/pages/ServicesPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import DashboardPage from './features/properties/pages/DashboardPage'
import AdminIndexPage from './features/properties/pages/AdminIndexPage'
import AdminDashboardPage from './features/properties/pages/AdminDashboardPage'
import {SalesManagement} from './features/dashboard/pages/sales/SalesManagement'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Routes>
        {/* Public routes with navbar and footer */}
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
            <Footer />
          </>
        } />
        <Route path="/inmuebles" element={
          <>
            <Navbar />
            <PropertiesPage />
            <Footer />
          </>
        } />
        <Route path="/inmuebles/:id" element={
          <>
            <Navbar />
            <PropertyDetailsPage />
            <Footer />
          </>
        } />
        <Route path="/contactanos" element={
          <>
            <Navbar />
            <ContactPage />
            <Footer />
          </>
        } />
        <Route path="/nosotros" element={
          <>
            <Navbar />
            <AboutPage />
            <Footer />
          </>
        } />
        <Route path="/servicios" element={
          <>
            <Navbar />
            <ServicesPage />
            <Footer />
          </>
        } />

        {/* Auth routes with navbar/footer */}
        <Route path="/login" element={
          <>
            <Navbar />
            <LoginPage />
            <Footer />
          </>
        } />
        <Route path="/registro" element={
          <>
            <Navbar />
            <RegisterPage />
            <Footer />
          </>
        } />

        {/* Dashboard routes without navbar/footer */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Admin routes without navbar/footer */}
        <Route path="/admin" element={<AdminIndexPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route path="/dashboard/ventas" element={<SalesManagement />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
