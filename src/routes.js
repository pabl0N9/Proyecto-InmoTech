// Importa rutas centralizadas desde el archivo index
import { publicRoutes, publicNavigationLinks } from './routes/index';

// Re-exporta para mantener compatibilidad con imports existentes
export const routes = publicRoutes;
export const navigationLinks = publicNavigationLinks;
