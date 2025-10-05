import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleExpandedItem = useCallback((itemId) => {
    setExpandedItem(prev => prev === itemId ? null : itemId);
  }, []);

  const handleItemClick = useCallback((item) => {
    if (item.isExpandable) {
      // Si la sidebar está colapsada, la expandimos automáticamente
      if (isCollapsed) {
        setIsCollapsed(false);
      }
      toggleExpandedItem(item.id);
      setActiveItem(item.id);
    } else {
      setActiveItem(item.id);
      setActiveSubItem(null);
      setExpandedItem(null);

      // Navegación específica para "Gestion de ventas"
      if (item.id === 'ventas') {
        navigate('/dashboard/buyersManagement');
      }
      if (item.id === 'arriendos') {
        navigate('/dashboard/leasesManagement');
      }
    }
  }, [isCollapsed, toggleExpandedItem, navigate]);

  const handleSubItemClick = useCallback((subItemId) => {
    // Buscar el subItem correcto basado en el ID
    const allSubItems = [
      { id: 'dashboard', path: '/dashboard' },
      { id: 'gestion-compradores', path: '/dashboard/buyersManagement' },
      { id: 'gestion-ventas', path: '/dashboard/salesManagement' },
      { id: 'gestion-arrendatarios', path: '/dashboard/leasesManagement' },
      { id: 'gestion-arriendos', path: '/dashboard/renantManagement' }
    ];
    
    const subItem = allSubItems.find(item => item.id === subItemId);
    if (subItem) {
      navigate(subItem.path);
    }
  }, [navigate]);

  return {
    isCollapsed,
    toggleSidebar,
    expandedItem,
    toggleExpandedItem,
    activeItem,
    activeSubItem,
    handleItemClick,
    handleSubItemClick,
  };
};
