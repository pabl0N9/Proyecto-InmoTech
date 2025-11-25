export const routes = {
  home: '/',
  about: '/nosotros',
  services: '/servicios',
  properties: '/inmuebles',
  propertyDetails: '/inmuebles/:id',
  contact: '/contactanos',
  login: '/login',
  register: '/registro'
};

export const dashboardRoutes = {
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  properties: '/dashboard/salesManagement',
  owners: '/dashboard/salesManagement',
  clients: '/dashboard/citas',
  appointments: '/dashboard/citas',
  buyers: '/dashboard/buyersManagement',
  sales: '/dashboard/salesManagement',
  tenants: '/dashboard/leasesManagement',
  rentals: '/dashboard/renantManagement',
  reports: '/reportes/gestion',
  users: '/seguridad/usuarios',
  administrativos: '/seguridad/administrativos',
  roles: '/seguridad/roles'
};

export const navigationLinks = [
  { name: 'Inicio', path: routes.home },
  { name: 'Nosotros', path: routes.about },
  { name: 'Inmuebles', path: routes.properties },
  { name: 'Servicios', path: routes.services },
  { name: 'Contáctanos', path: routes.contact }
];

export default routes;
