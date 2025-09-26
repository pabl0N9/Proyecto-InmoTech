// Importa rutas centralizadas desde el archivo index
import { dashboardRoutes } from '../../routes/index';

import {
  MdDashboard,
  MdHome,
  MdCalendarToday,
  MdPeople,
  MdEventNote,
  MdTrendingUp,
  MdShoppingCart,
  MdAttachMoney,
  MdBusiness,
  MdPersonAdd,
  MdAssignment,
  MdBarChart,
  MdSecurity,
  MdGroup,
  MdAdminPanelSettings,
  MdLogout,
  MdChevronRight,
  MdWeb
} from 'react-icons/md';

export const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: MdDashboard,
    path: dashboardRoutes.dashboard,
    isExpandable: false
  },
  {
    id: 'inmuebles',
    title: 'Inmuebles',
    icon: MdHome,
    isExpandable: true,
    subItems: [
      {
        id: 'gestion-inmuebles',
        title: 'Gestión de Inmuebles',
        path: dashboardRoutes.properties
      }
    ]
  },
  {
    id: 'citas',
    title: 'Citas',
    icon: MdCalendarToday,
    isExpandable: true,
    subItems: [
      {
        id: 'gestion-clientes',
        title: 'Gestión de Clientes',
        path: dashboardRoutes.clients
      },
      {
        id: 'gestion-citas',
        title: 'Gestión de Citas',
        path: dashboardRoutes.appointments
      }
    ]
  },
  {
    id: 'ventas',
    title: 'Ventas',
    icon: MdTrendingUp,
    isExpandable: true,
    subItems: [
      {
        id: 'gestion-comprador',
        title: 'Gestión de Comprador',
        path: dashboardRoutes.buyers
      },
      {
        id: 'gestion-ventas',
        title: 'Gestión de Ventas',
        path: dashboardRoutes.sales
      }
    ]
  },
  {
    id: 'arriendos',
    title: 'Arriendos',
    icon: MdBusiness,
    isExpandable: true,
    subItems: [
      {
        id: 'gestion-arrendatario',
        title: 'Gestión de Arrendatario',
        path: dashboardRoutes.tenants
      },
      {
        id: 'gestion-arriendos',
        title: 'Gestión de Arriendos',
        path: dashboardRoutes.rentals
      }
    ]
  },
  {
    id: 'reportes',
    title: 'Reportes Inmobiliarios',
    icon: MdBarChart,
    isExpandable: true,
    subItems: [
      {
        id: 'gestion-reportes',
        title: 'Gestión de Reportes',
        path: dashboardRoutes.reports
      }
    ]
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: MdSecurity,
    isExpandable: true,
    subItems: [
      {
        id: 'usuarios',
        title: 'Usuarios',
        path: dashboardRoutes.users
      },
      {
        id: 'roles',
        title: 'Roles',
        path: dashboardRoutes.roles
      }
    ]
  }
];

export const logoutItem = {
  id: 'logout',
  title: 'Cerrar Sesión',
  icon: MdLogout,
  action: 'logout',
  isExpandable: false
};

export const goToSiteItem = {
  id: 'go-to-site',
  title: 'Ir al Sitio',
  icon: MdWeb,
  action: 'go-to-site',
  isExpandable: false
};
