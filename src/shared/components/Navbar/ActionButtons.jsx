import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

/**
 * Action buttons component (Login/Register or User Profile)
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onButtonClick - Callback when a button is clicked
 */
const ActionButtons = ({ className = '', onButtonClick }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      // Mostrar toast de cierre de sesión exitoso
      toast({
        title: "Cierre de sesión exitoso",
        description: "Hasta luego. ¡Gracias por usar nuestro sistema!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className={`hidden md:flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-3 text-white">
          <span className="text-sm font-medium">{user.nombre_completo || user.email}</span>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center justify-center w-10 h-10 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const buttons = [
    {
      to: '/registro',
      icon: UserPlus,
      label: 'Crear cuenta',
      primary: false
    },
    {
      to: '/login',
      icon: User,
      label: 'Iniciar sesión',
      primary: true
    }
  ];

  return (
    <div className={`hidden md:flex items-center space-x-4 ${className}`}>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <Link
            key={button.to}
            to={button.to}
            className="flex items-center space-x-2 px-4 py-2 border border-white text-white bg-transparent rounded-full hover:bg-white hover:text-[#00457B] transition-all duration-300"
            onClick={onButtonClick}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{button.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default ActionButtons;
