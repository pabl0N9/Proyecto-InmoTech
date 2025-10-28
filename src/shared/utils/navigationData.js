// Importa rutas centralizadas desde el archivo index
import { dashboardRoutes } from '../../routes/index';

// Importa íconos de react-icons
import {
  MdDashboard,
  MdHome,
  MdCalendarToday,
  MdTrendingUp,
  MdBusiness,
  MdBarChart,
  MdSecurity,
  MdLogout,
  MdWeb
} from 'react-icons/md';

// Lista de elementos principales del menú de navegación
export const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: MdDashboard,
    path: dashboardRoutes.dashboard,
    isExpandable: false,
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
      },
      {
        id: 'gestion-propietarios',
        title: 'Gestión de Propietarios',
        path: dashboardRoutes.owners
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
        path: dashboardRoutes.clients || '/citas/clientes',
      },
      {
        id: 'gestion-citas',
        title: 'Gestión de Citas',
        path: dashboardRoutes.appointments || '/citas/gestion',
      },
    ],
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
        path: dashboardRoutes.buyers || '/dashboard/buyersManagement',
      },
      {
        id: 'gestion-ventas',
        title: 'Gestión de Ventas',
        path: dashboardRoutes.sales || '/dashboard/salesManagement',
      },
    ],
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
        path: dashboardRoutes.tenants || '/dashboard/leasesManagement',
      },
      {
        id: 'gestion-arriendos',
        title: 'Gestión de Arriendos',
        path: dashboardRoutes.rentals || '/dashboard/renantManagement',
      },
    ],
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
        path: dashboardRoutes.reports || '/reportes/gestion',
      },
    ],
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
        path: dashboardRoutes.users || '/seguridad/usuarios',
      },      
      {
        id: 'administrativos',
        title: 'Administrativos',
        path: dashboardRoutes.administrativos || '/seguridad/administrativos',
      },

      {
        id: 'roles',
        title: 'Roles',
        path: dashboardRoutes.roles || '/seguridad/roles',
      },
    ],
  },
];

// Elemento para cerrar sesión
export const logoutItem = {
  id: 'logout',
  title: 'Cerrar Sesión',
  icon: MdLogout,
  action: 'logout',
  isExpandable: false,
};

// Elemento para ir al sitio público
export const goToSiteItem = {
  id: 'go-to-site',
  title: 'Ir al Sitio',
  icon: MdWeb,
  action: 'go-to-site',
  isExpandable: false,
};