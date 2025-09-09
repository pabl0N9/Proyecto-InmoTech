import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

/**
 * Action buttons component (Login/Register)
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onButtonClick - Callback when a button is clicked
 */
const ActionButtons = ({ className = '', onButtonClick }) => {
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
