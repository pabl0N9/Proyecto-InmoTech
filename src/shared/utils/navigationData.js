// Centraliza las rutas para el menú del dashboard
import { dashboardRoutes } from '../../routes/index';

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

// Función para filtrar navegación basada en permisos del usuario
export const getFilteredNavigation = (availableModules = []) => {
  // ✅ ADMINISTRADORES VEN TODOS LOS MÓDULOS
  if (availableModules.includes('propiedades') || availableModules.includes('citas') ||
      availableModules.includes('reportes') || availableModules.includes('administrativos')) {
    return navigationItems; // Mostrar todos los módulos disponibles
  }

  // Para usuarios normales, filtrar por permisos específicos
  const filteredItems = [navigationItems[0]]; // Siempre incluir Dashboard

  // Solo incluir módulos implementados
  if (availableModules.includes('citas') || availableModules.includes('gCitas')) {
    filteredItems.push(navigationItems.find(item => item.id === 'citas')); // Citas
  }

  if (availableModules.includes('propiedades')) {
    filteredItems.push(navigationItems.find(item => item.id === 'inmuebles')); // Inmuebles
  }

  if (availableModules.includes('reportes')) {
    filteredItems.push(navigationItems.find(item => item.id === 'reportes')); // Reportes
  }

  // El módulo de Seguridad incluye solo los módulos implementados
  const seguridadItem = navigationItems.find(item => item.id === 'seguridad'); // Copia del ítem de Seguridad
  const subItemsSeguridad = [];

  if (availableModules.includes('gAdministrativos') || availableModules.includes('administrativos')) {
    subItemsSeguridad.push(seguridadItem.subItems[1]); // Administrativos (índice 1)
  }
  if (availableModules.includes('gRoles')) {
    subItemsSeguridad.push(seguridadItem.subItems[2]); // Roles (índice 2)
  }

  if (subItemsSeguridad.length > 0) {
    const newseguridadItem = { ...seguridadItem, subItems: subItemsSeguridad };
    filteredItems.push(newseguridadItem);
  }

  return filteredItems;
};

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
        title: 'Gestion de Inmuebles',
        path: dashboardRoutes.properties
      },
      {
        id: 'gestion-propietarios',
        title: 'Gestion de Propietarios',
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
        id: 'gestion-citas',
        title: 'Gestion de Citas',
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
        title: 'Gestion de Comprador',
        path: dashboardRoutes.buyers || '/dashboard/buyersManagement',
      },
      {
        id: 'gestion-ventas',
        title: 'Gestion de Ventas',
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
        title: 'Gestion de Arrendatario',
        path: dashboardRoutes.tenants || '/dashboard/leasesManagement',
      },
      {
        id: 'gestion-arriendos',
        title: 'Gestion de Arriendos',
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
        title: 'Gestion de Reportes',
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

export const logoutItem = {
  id: 'logout',
  title: 'Cerrar Sesion',
  icon: MdLogout,
  action: 'logout',
  isExpandable: false,
};

export const goToSiteItem = {
  id: 'go-to-site',
  title: 'Ir al Sitio',
  icon: MdWeb,
  action: 'go-to-site',
  isExpandable: false,
};
