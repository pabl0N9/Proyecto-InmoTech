import { useState, useCallback } from 'react';

export const useSidebar = () => {
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
    }
  }, [isCollapsed, toggleExpandedItem]);

  const handleSubItemClick = useCallback((subItem, parentId) => {
    setActiveItem(parentId);
    setActiveSubItem(subItem.id);
  }, []);

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