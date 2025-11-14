import { Routes, Route } from 'react-router-dom'
import Navbar from './shared/components/Navbar'
import Footer from './shared/components/Footer'
import ScrollToTop from './shared/components/ScrollToTop'
import { Toaster } from './shared/components/ui/toaster'
import DashboardLayout from './shared/components/dashboard/Layout/DashboardLayout'
import ProtectedRoute, { EmployeeRoute, DashboardRoute } from './shared/components/ProtectedRoute'

// Pages
import HomePage from './features/properties/pages/HomePage'
import PropertiesPage from './features/properties/pages/PropertiesPage'
import PropertyDetailsPage from './features/properties/pages/PropertyDetailsPage'
import ContactPage from './features/contact/pages/ContactPage'
import AboutPage from './features/about/pages/AboutPage'
import ServicesPage from './features/services/pages/ServicesPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'

// Dashboard pages
import DashboardPage from './features/dashboard/DashboardPage'
import { SalesManagementPage } from './features/dashboard/pages/sales/SalesManagementPage'
import { BuyersManagementPage } from './features/dashboard/pages/sales/BuyerManagementPage'
import { LeasesManagementPage } from './features/dashboard/pages/leases/LeasesManagementPage'
import { RenantManagementPage } from './features/dashboard/pages/leases/RenantManagementPage'
import AppointmentPage from './features/dashboard/pages/appointment/AppointmentPage'
import Reports from './features/dashboard/pages/reports/Reports'
import Roles from './features/dashboard/pages/roles/Roles'
import AdministrativosPage from './features/dashboard/pages/administrativos/AdministrativosPage'
import UsersPage from './features/dashboard/pages/users/UsersPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Routes>

        {/* Public routes with navbar and footer */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          }
        />
        <Route
          path="/inmuebles"
          element={
            <>
              <Navbar />
              <PropertiesPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/inmuebles/:id"
          element={
            <>
              <Navbar />
              <PropertyDetailsPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/contactanos"
          element={
            <>
              <Navbar />
              <ContactPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/nosotros"
          element={
            <>
              <Navbar />
              <AboutPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/servicios"
          element={
            <>
              <Navbar />
              <ServicesPage />
              <Footer />
            </>
          }
        />

        {/* Auth routes with navbar/footer */}
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <LoginPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/registro"
          element={
            <>
              <Navbar />
              <RegisterPage />
              <Footer />
            </>
          }
        />

        {/* Dashboard routes with sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/salesManagement"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <SalesManagementPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/buyersManagement"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <BuyersManagementPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/leasesManagement"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <LeasesManagementPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/renantManagement"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <RenantManagementPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/dashboard/citas"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <AppointmentPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/reportes/gestion"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/seguridad/roles"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <Roles />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/seguridad/administrativos"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <AdministrativosPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />
        <Route
          path="/seguridad/usuarios"
          element={
            <DashboardRoute>
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </DashboardRoute>
          }
        />

      </Routes>
      <Toaster />
    </div>
  )
}

export default App
