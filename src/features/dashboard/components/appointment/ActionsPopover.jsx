import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

const ActionsPopover = ({
  isOpen,
  onClose,
  referenceElement,
  appointment = null,
  onView,
  onEdit,
  onDelete,
  onCreate,
  date = null
}) => {
  const popoverRef = useRef(null);

  const { x, y, reference, floating, strategy, refs } = useFloating({
    placement: 'right-start',
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Sync reference element
  React.useEffect(() => {
    if (referenceElement) {
      refs.setReference(referenceElement);
    }
  }, [referenceElement, refs]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  const actions = appointment ? [
    {
      label: 'Ver',
      icon: Eye,
      action: () => onView(appointment),
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'Editar',
      icon: Edit,
      action: () => onEdit(appointment),
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      action: () => onDelete(appointment),
      color: 'text-red-600 hover:bg-red-50'
    }
  ] : [
    {
      label: 'Crear cita',
      icon: Plus,
      action: () => onCreate(date),
      color: 'text-blue-600 hover:bg-blue-50'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={(node) => {
            popoverRef.current = node;
            refs.setFloating(node);
          }}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.15 }}
          className="z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px] max-w-[90vw] w-auto"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          role="menu"
          aria-label={appointment ? "Acciones de cita" : "Acciones de día"}
        >
          {actions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleAction(item.action)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${item.color}`}
              role="menuitem"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionsPopover;
