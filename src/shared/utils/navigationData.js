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
      path: '/dashboard',
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
          path: '/inmuebles/gestion'
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
          path: '/citas/clientes'
        },
        {
          id: 'gestion-citas',
          title: 'Gestión de Citas',
          path: '/citas/gestion'
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
          path: '/sales/buyersManagement'
        },
        {
          id: 'gestion-ventas',
          title: 'Gestión de Ventas',
          path: '/sales/salesManagement'
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
          path: '/arriendos/arrendatario'
        },
        {
          id: 'gestion-arriendos',
          title: 'Gestión de Arriendos',
          path: '/arriendos/gestion'
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
          path: '/reportes/gestion'
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
          path: '/seguridad/usuarios'
        },
        {
          id: 'roles',
          title: 'Roles',
          path: '/seguridad/roles'
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