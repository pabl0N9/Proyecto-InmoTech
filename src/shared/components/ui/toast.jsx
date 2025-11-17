import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'success', 
  isVisible = false, 
  onClose,
  duration = 4000,
  position = 'top-right'
}) => {
  const [isShowing, setIsShowing] = React.useState(isVisible);

  React.useEffect(() => {
    setIsShowing(isVisible);
    
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => onClose && onClose(), 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          className={`fixed z-50 ${getPositionClasses()}`}
        >
          <div className={`
            flex items-center p-4 rounded-lg border shadow-lg max-w-sm
            ${getBackgroundColor()}
          `}>
            <div className="flex-shrink-0 mr-3">
              {getIcon()}
            </div>
            <div className={`flex-1 text-sm font-medium ${getTextColor()}`}>
              {message}
            </div>
            {onClose && (
              <button
                onClick={() => {
                  setIsShowing(false);
                  setTimeout(() => onClose(), 300);
                }}
                className={`
                  flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-white/50 transition-colors
                  ${getTextColor()}
                `}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para usar toast de manera más sencilla
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = React.useCallback((message, type = 'success', options = {}) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      ...options
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove después del duration
    const duration = options.duration || 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  };
};

// Componente contenedor para múltiples toasts
export const ToastContainer = ({ toasts, onRemoveToast, position = 'top-right' }) => {
  return (
    <div className="fixed z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: index * 80, // Espaciado entre toasts
              scale: 1 
            }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className={getPositionClasses(position)}
            style={{ pointerEvents: 'auto' }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={true}
              onClose={() => onRemoveToast(toast.id)}
              duration={0} // Manejado por el contenedor
              position="static"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getPositionClasses = (position) => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-right':
      return 'bottom-4 right-4';
    default:
      return 'top-4 right-4';
  }
};

export default Toast;
