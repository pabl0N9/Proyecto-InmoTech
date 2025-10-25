import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationItems } from '../utils/navigationData';
import { dashboardRoutes } from '../../routes/index';

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  /** 🔹 Alternar visibilidad de la barra lateral */
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /** 🔹 Alternar expansión de ítems principales */
  const toggleExpandedItem = useCallback((itemId) => {
    setExpandedItem(prev => (prev === itemId ? null : itemId));
  }, []);

  /** 🔹 Manejo de clic en ítems principales */
  const handleItemClick = useCallback(
    (item) => {
      if (item.isExpandable) {
        if (isCollapsed) setIsCollapsed(false);
        toggleExpandedItem(item.id);
        setActiveItem(item.id);
      } else {
        setActiveItem(item.id);
        setActiveSubItem(null);
        setExpandedItem(null);

        // Redirección directa para ítems sin submenús
        if (item.path) navigate(item.path);
      }
    },
    [isCollapsed, toggleExpandedItem, navigate]
  );

  /** 🔹 Manejo de clic en subítems */
  const handleSubItemClick = useCallback(
    (subItemId) => {
      const allSubItems = navigationItems.flatMap(item =>
        item.subItems
          ? item.subItems.map(sub => ({ ...sub, parentId: item.id }))
          : []
      );

      const subItem = allSubItems.find(sub => sub.id === subItemId);
      if (subItem) {
        setActiveItem(subItem.parentId);
        setActiveSubItem(subItem.id);
        navigate(subItem.path);
      }
    },
    [navigate]
  );

  /** 🔹 Sincroniza la barra lateral con la ruta actual */
  useEffect(() => {
    const currentPath = location.pathname;

    // Mapea todas las rutas (principales y subrutas)
    const dynamicRouteMapping = {};
    navigationItems.forEach(item => {
      if (item.path) {
        dynamicRouteMapping[item.path] = {
          activeItem: item.id,
          activeSubItem: null,
          expandedItem: null,
        };
      }
      if (item.subItems) {
        item.subItems.forEach(sub => {
          dynamicRouteMapping[sub.path] = {
            activeItem: item.id,
            activeSubItem: sub.id,
            expandedItem: item.id,
          };
        });
      }
    });

    // Buscar coincidencia con la ruta actual
    const sortedRoutes = Object.entries(dynamicRouteMapping).sort(
      ([a], [b]) => b.length - a.length
    );
    const matchingRoute = sortedRoutes.find(([path]) =>
      currentPath === path || currentPath.startsWith(path + '/')
    );

    if (matchingRoute) {
      const [, state] = matchingRoute;
      setActiveItem(state.activeItem);
      setActiveSubItem(state.activeSubItem);
      setExpandedItem(state.expandedItem);
    } else {
      setActiveItem('dashboard');
      setActiveSubItem(null);
      setExpandedItem(null);
      if (item.path) {
        navigate(item.path);
      }
    }
  }, [isCollapsed, toggleExpandedItem, navigate]);

  const handleSubItemClick = useCallback((subItemId) => {
    const allSubItems = navigationItems.flatMap(item =>
      item.subItems ? item.subItems.map(sub => ({ ...sub, parentId: item.id })) : []
    );
    const subItem = allSubItems.find(item => item.id === subItemId);
    if (subItem) {
      navigate(subItem.path);
    }
  }, [location.pathname]);

  /** 🔹 Cierra los menús al hacer clic fuera de la barra lateral */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setExpandedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** 🔹 Retorna funciones y estados para el componente Sidebar */
  return {
    isCollapsed,
    toggleSidebar,
    expandedItem,
    toggleExpandedItem,
    activeItem,
    activeSubItem,
    handleItemClick,
    handleSubItemClick,
    sidebarRef,
  };
};
