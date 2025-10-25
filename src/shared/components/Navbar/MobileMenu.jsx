import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, LogOut } from 'lucide-react';
import { routes } from '@/routes';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Mobile menu component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClose - Callback to close the menu
 */
const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { to: routes.about, label: 'Nosotros' },
    { to: routes.properties, label: 'Inmuebles' },
    { to: routes.services, label: 'Servicios' },
    { to: routes.contact, label: 'Contactanos' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Mostrar toast de cierre de sesión exitoso
      if (typeof window !== 'undefined' && window.toast) {
        setTimeout(() => {
          window.toast({
            title: "Cierre de sesión exitoso",
            description: "Hasta luego. ¡Gracias por usar nuestro sistema!",
            variant: "default"
          });
        }, 100);
      }
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="bg-[#00457B] border-t border-white/20 mt-4">
      <div className="px-4 py-4 space-y-4">
        {/* Mobile Navigation Links */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block text-white hover:text-blue-200 transition-colors font-medium py-2"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Action Buttons */}
        <div className="space-y-2 pt-6 border-t border-white/20 mt-2">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center space-x-3 text-white py-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{user.nombre_completo || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/registro"
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
                onClick={onClose}
              >
                <UserPlus className="h-4 w-4" />
                <span className="text-sm font-medium">Crear cuenta</span>
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
                onClick={onClose}
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Iniciar sesión</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
