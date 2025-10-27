import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppointmentProvider } from './shared/contexts/AppointmentContext.jsx'
import { AuthProvider } from './shared/contexts/AuthContext.jsx'
import { AdministrativosProvider } from './shared/contexts/AdministrativosContext.jsx'
import { Toaster } from './shared/components/ui/toaster.jsx'
import './shared/styles/globals.css'
import './shared/styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppointmentProvider>
          <AdministrativosProvider>
            <App />
            <Toaster />
          </AdministrativosProvider>
        </AppointmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
