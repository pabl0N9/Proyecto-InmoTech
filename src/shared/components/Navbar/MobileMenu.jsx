import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';
import { routes } from '@/routes';

/**
 * Mobile menu component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClose - Callback to close the menu
 */
const MobileMenu = ({ isOpen, onClose }) => {
  const navItems = [
    { to: routes.about, label: 'Nosotros' },
    { to: routes.properties, label: 'Inmuebles' },
    { to: routes.services, label: 'Servicios' },
    { to: routes.contact, label: 'Contactanos' }
  ];

  const actionButtons = [
    {
      to: '/registro',
      icon: UserPlus,
      label: 'Crear cuenta'
    },
    {
      to: '/login',
      icon: User,
      label: 'Iniciar sesión'
    }
  ];

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
          {actionButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Link
                key={button.to}
                to={button.to}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{button.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
