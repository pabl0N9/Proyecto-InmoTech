import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove después del duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', options);
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  const value = {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemoveToast={removeToast}
        position="top-right"
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;