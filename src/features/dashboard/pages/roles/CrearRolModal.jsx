import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Calendar,
  ShoppingCart,
  DollarSign,
  Home,
  Key,
  BarChart3,
  User,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  AlertCircle
} from "lucide-react";

const modulesData = [
  {
    name: "Gestión de Inmuebles",
    key: "gInmuebles",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Building2,
    color: "bg-slate-50 border-slate-200",
    description: "Administración completa del portafolio inmobiliario"
  },
  {
    name: "Gestión de Clientes",
    key: "gClientes",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Users,
    color: "bg-blue-50 border-blue-200",
    description: "Control de base de datos de clientes y prospectos"
  },
  {
    name: "Gestión de Citas",
    key: "gCitas",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Calendar,
    color: "bg-emerald-50 border-emerald-200",
    description: "Programación y seguimiento de citas comerciales"
  },
  {
    name: "Gestión de Compradores",
    key: "gComprador",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: ShoppingCart,
    color: "bg-orange-50 border-orange-200",
    description: "Administración de clientes compradores potenciales"
  },
  {
    name: "Gestión de Ventas",
    key: "gVentas",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: DollarSign,
    color: "bg-green-50 border-green-200",
    description: "Control de procesos de venta y transacciones"
  },
  {
    name: "Gestión de Arrendatarios",
    key: "gArrendatario",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Home,
    color: "bg-purple-50 border-purple-200",
    description: "Administración de inquilinos y contratos de arriendo"
  },
  {
    name: "Gestión de Arriendos",
    key: "gArriendos",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Key,
    color: "bg-indigo-50 border-indigo-200",
    description: "Control de propiedades en arriendo y pagos"
  },
  {
    name: "Reportes Inmobiliarios",
    key: "gReporteInmuebles",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: BarChart3,
    color: "bg-cyan-50 border-cyan-200",
    description: "Generación de informes y análisis de mercado"
  },
  {
    name: "Administración de Usuarios",
    key: "usuarios",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: User,
    color: "bg-gray-50 border-gray-200",
    description: "Control de acceso y gestión de personal"
  },
  {
    name: "Administración de Roles",
    key: "roles",
    permisos: ["Crear", "Editar", "Eliminar", "Ver"],
    icon: Shield,
    color: "bg-red-50 border-red-200",
    description: "Configuración de permisos y niveles de acceso"
  },
];

const permissionConfig = {
  "Crear": { icon: Plus, color: "text-green-600", bg: "bg-green-50" },
  "Editar": { icon: Edit, color: "text-blue-600", bg: "bg-blue-50" },
  "Eliminar": { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  "Ver": { icon: Eye, color: "text-gray-600", bg: "bg-gray-50" }
};

export default function CrearRolModal({ isOpen, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [modules, setModules] = useState(
    modulesData.map((mod) => ({
      ...mod,
      enabled: true,
      permisosSeleccionados: [...mod.permisos],
    }))
  );
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre del rol es obligatorio";
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    const hasAnyPermission = modules.some(mod => 
      mod.enabled && mod.permisosSeleccionados.length > 0
    );
    
    if (!hasAnyPermission) {
      newErrors.permisos = "Debe seleccionar al menos un permiso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleModule = (index) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              enabled: !mod.enabled,
              permisosSeleccionados: !mod.enabled ? [...mod.permisos] : [],
            }
          : mod
      )
    );
    setErrors(prev => ({ ...prev, permisos: undefined }));
  };

  const togglePermiso = (index, permiso) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              permisosSeleccionados: mod.permisosSeleccionados.includes(permiso)
                ? mod.permisosSeleccionados.filter((p) => p !== permiso)
                : [...mod.permisosSeleccionados, permiso],
            }
          : mod
      )
    );
    setErrors(prev => ({ ...prev, permisos: undefined }));
  };

  const handleGuardar = () => {
    // Validar pero no bloquear el botón
    const isValid = validateForm();
    
    if (!isValid) {
      // Si no es válido, solo mostrar los errores pero no proceder
      return;
    }

    // Convertir el formato de permisos para que coincida con el esperado
    const permisos = {};
    modules.forEach((mod) => {
      if (mod.enabled && mod.permisosSeleccionados.length > 0) {
        // Crear objeto con formato: { crear: true, editar: true, eliminar: true, ver: true }
        const permisosObj = {};
        mod.permisosSeleccionados.forEach((permiso) => {
          permisosObj[permiso.toLowerCase()] = true;
        });
        permisos[mod.key] = permisosObj;
      }
    });

    // Crear el nuevo rol con estado activo por defecto
    const nuevoRol = {
      nombre: nombre.trim(),
      estado: true,
      permisos
    };

    onSave(nuevoRol);
    
    // Limpiar el formulario
    setNombre("");
    setModules(
      modulesData.map((mod) => ({
        ...mod,
        enabled: true,
        permisosSeleccionados: [...mod.permisos],
      }))
    );
    setErrors({});
    onClose();
  };

  const activeModulesCount = modules.filter(mod => mod.enabled).length;
  const totalPermissionsCount = modules.reduce((acc, mod) => 
    acc + (mod.enabled ? mod.permisosSeleccionados.length : 0), 0
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <div className="pr-12">
              <h2 className="text-xl font-bold mb-1">Crear Nuevo Rol</h2>
              <p className="text-slate-300 text-sm">
                Configure los permisos y accesos para el nuevo rol del sistema
              </p>
              <div className="flex gap-4 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>{activeModulesCount} módulos activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{totalPermissionsCount} permisos seleccionados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
            {/* Nombre del Rol */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Rol *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrors(prev => ({ ...prev, nombre: undefined }));
                }}
                placeholder="Ej: Agente Comercial Senior Senior"
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all ${
                  errors.nombre 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-slate-400'
                }`}
              />
              {errors.nombre && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.nombre}</span>
                </div>
              )}
            </div>

            {/* Error de permisos */}
            {errors.permisos && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span className="font-medium text-sm">{errors.permisos}</span>
                </div>
              </div>
            )}

            {/* Módulos y Permisos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración de Permisos por Módulo
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {modules.map((module, index) => {
                  const IconComponent = module.icon;
                  
                  return (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-2 rounded-xl transition-all duration-200 ${
                        module.enabled 
                          ? `${module.color} shadow-sm` 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Header del módulo */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${
                              module.enabled ? 'bg-white shadow-sm' : 'bg-gray-100'
                            }`}>
                              <IconComponent 
                                size={18} 
                                className={module.enabled ? 'text-gray-700' : 'text-gray-400'} 
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${
                                module.enabled ? 'text-gray-800' : 'text-gray-500'
                              }`}>
                                {module.name}
                              </h4>
                              <p className={`text-xs mt-1 ${
                                module.enabled ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {module.description}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={module.enabled}
                              onChange={() => toggleModule(index)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Permisos */}
                      {module.enabled && (
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {module.permisos.map((permiso) => {
                              const config = permissionConfig[permiso];
                              const IconPermiso = config.icon;
                              const isSelected = module.permisosSeleccionados.includes(permiso);
                              
                              return (
                                <button
                                  key={permiso}
                                  onClick={() => togglePermission(index, permiso)}
                                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                                    isSelected
                                      ? `${config.bg} ${config.color} border-current shadow-sm`
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <IconPermiso size={14} />
                                  <span>{permiso}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white rounded-b-2xl px-6 py-5 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 shadow-sm">
            <button
              onClick={onClose}
              className="px-6 py-3 w-full sm:w-auto min-w-[120px] text-gray-700 bg-gray-100 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGuardar();
              }}
              className="px-6 py-3 w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold text-sm flex items-center gap-2 justify-center hover:from-slate-900 hover:to-black hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Save size={18} />
              Crear Rol
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
