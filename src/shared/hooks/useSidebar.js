import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);

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
      
      // Navegar a la ruta si existe
      if (item.path) {
        navigate(item.path);
      }
    }
  }, [isCollapsed, toggleExpandedItem, navigate]);

  const handleSubItemClick = useCallback((subItem, parentId) => {
    setActiveItem(parentId);
    setActiveSubItem(subItem.id);
    
    // Navegar a la ruta del subitem
    if (subItem.path) {
      navigate(subItem.path);
    }
  }, [navigate]);

  return {
    isCollapsed,
    expandedItem,
    activeItem,
    activeSubItem,
    toggleSidebar,
    toggleExpandedItem,
    handleItemClick,
    handleSubItemClick
  };
};