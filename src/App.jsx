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
import DashboardPage from './features/dashboard/pages/sales/DashboardPage'
import { SalesManagementPage } from './features/dashboard/pages/sales/pages/SalesManagementPage'
import { BuyersManagementPage } from './features/dashboard/pages/sales/pages/BuyerManagementPage'
import { LeasesManagementPage } from './features/dashboard/pages/leases/pages/LeasesManagementPage'
import { RenantManagementPage } from './features/dashboard/pages/leases/pages/RenantManagementPage'

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

        <Route path="/dashboard/salesManagement" element={<SalesManagementPage />} />

        <Route path="/dashboard/buyersManagement" element={<BuyersManagementPage/>} />

        <Route path="/dashboard/leasesManagement" element={<LeasesManagementPage/>}/>

        <Route path="/dashboard/renantManagement" element={<RenantManagementPage/>}/>

      </Routes>
      <Toaster />
    </div>
  )
}

export default App