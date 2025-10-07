import React from "react";
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
  CheckCircle,
  XCircle,
  Crown
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
  "crear": { icon: Plus, color: "text-green-600", bg: "bg-green-50", label: "Crear" },
  "editar": { icon: Edit, color: "text-blue-600", bg: "bg-blue-50", label: "Editar" },
  "eliminar": { icon: Trash2, color: "text-red-600", bg: "bg-red-50", label: "Eliminar" },
  "ver": { icon: Eye, color: "text-gray-600", bg: "bg-gray-50", label: "Ver" }
};

// Vista simple para roles normales
const permissionGroups = [
  { key: "roles", label: "Roles" },
  { key: "gEmpleados", label: "G Empleados" },
  { key: "clientes", label: "Clientes" },
  { key: "usuarios", label: "Usuarios" },
  { key: "reporteInmuebles", label: "Reporte inmuebles" },
  { key: "inmuebles", label: "Inmuebles" },
  { key: "citas", label: "Citas" },
];

const permissionActions = ["crear", "editar", "eliminar", "ver"];

export default function VerRolModal({ isOpen, onClose, rol }) {
  if (!isOpen) return null;

  // Detectar si es Super Admin
  const isSuperAdmin = rol?.nombre?.toLowerCase().includes('super admin') || 
                       rol?.nombre?.toLowerCase().includes('superadmin') ||
                       rol?.id === "01";

  // Helper to check if a permission is granted
  const hasPermiso = (groupKey, actionKey) => {
    return rol?.permisos?.[groupKey]?.[actionKey] || false;
  };

  // Helper to get all permissions for a group
  const getPermisosGrupo = (groupKey) => {
    const permisos = rol?.permisos?.[groupKey] || {};
    return Object.entries(permisos)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  // Vista completa para Super Admin
  if (isSuperAdmin) {
    const totalModulos = modulesData.length;
    const modulosConPermisos = modulesData.filter(modulo => 
      getPermisosGrupo(modulo.key).length > 0
    ).length;
    const totalPermisosPosibles = modulesData.length * 4;
    const totalPermisosActivos = modulesData.reduce((total, modulo) => 
      total + getPermisosGrupo(modulo.key).length, 0
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header especial para Super Admin */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>Super Administrador</span>
                  <Crown className="h-6 w-6" />
                </h2>
                <p className="text-orange-100">Acceso completo a todos los módulos y permisos del sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Información del rol */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <label className="block text-sm font-medium text-amber-700 mb-2">Nombre del Rol</label>
                <div className="text-xl font-semibold text-amber-900 flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>{rol?.nombre || "Super Admin"}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <label className="block text-sm font-medium text-green-700 mb-2">Estado</label>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Máximo Privilegio</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-2">Cobertura de Permisos</label>
                <div className="text-xl font-semibold text-blue-900">
                  {totalPermisosActivos}/{totalPermisosPosibles}
                </div>
                <div className="text-sm text-blue-600">
                  {modulosConPermisos}/{totalModulos} módulos activos
                </div>
              </div>
            </div>

            {/* Banner de privilegios completos */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
              <div className="flex items-center">
                <Crown className="h-6 w-6 text-amber-600 mr-3" />
                <div>
                  <p className="font-bold text-amber-800">Privilegios de Super Administrador</p>
                  <p className="text-sm text-amber-700">
                    Este rol tiene acceso completo y sin restricciones a todos los módulos, funciones y configuraciones del sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen de permisos */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-amber-600" />
                <span>Resumen de Permisos Completos</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(permissionConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = modulesData.length; // Super admin tiene todos los permisos
                  
                  return (
                    <div key={key} className={`${config.bg} border-2 border-green-300 rounded-lg p-4 text-center shadow-sm`}>
                      <Icon className={`h-6 w-6 ${config.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">{config.label}</div>
                      <div className="text-xs text-green-600 font-medium mt-1">✓ Completo</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Módulos y permisos detallados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                <span>Todos los Módulos del Sistema</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modulesData.map((modulo) => {
                  const Icon = modulo.icon;
                  
                  return (
                    <div
                      key={modulo.key}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-md"
                    >
                      {/* Header del módulo */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="p-3 rounded-lg bg-green-100">
                          <Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{modulo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{modulo.description}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ COMPLETO
                        </div>
                      </div>

                      {/* Permisos del módulo */}
                      <div className="grid grid-cols-2 gap-3">
                        {modulo.permisos.map((permiso) => {
                          const permisoKey = permiso.toLowerCase();
                          const config = permissionConfig[permisoKey];
                          const PermisoIcon = config?.icon || Eye;
                          
                          return (
                            <div
                              key={permiso}
                              className="flex items-center space-x-3 p-3 rounded-lg border bg-white border-green-200 shadow-sm"
                            >
                              <div className={`p-2 rounded-md ${config?.bg || 'bg-gray-50'}`}>
                                <PermisoIcon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {permiso}
                                </span>
                              </div>
                              <div>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-t border-amber-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista simple para roles normales (código original)
  const estadoActivo = rol?.estado;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[650px] relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
        >
          &#x2715;
        </button>

        <h2 className="text-xl font-bold mb-4">Ver rol</h2>

        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={rol?.nombre || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Permission groups */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {permissionGroups.map(({ key, label }) => {
            const permisosActivos = getPermisosGrupo(key);
            const tienePermisos = permisosActivos.length > 0;
            
            return (
              <div
                key={key}
                className="border rounded p-3 flex flex-col gap-2 min-w-[150px]"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={tienePermisos}
                    disabled
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
                
                {tienePermisos ? (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Permisos activos:</p>
                    <ul className="list-disc pl-5">
                      {permisosActivos.map(permiso => (
                        <li key={permiso} className="capitalize">{permiso}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin permisos</p>
                )}
              </div>
            );
          })}

          {/* Estado group */}
          <div className="border rounded p-3 flex flex-col gap-2 min-w-[150px] justify-center">
            <div className="font-semibold mb-2">Estado</div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={estadoActivo}
                disabled
                className="w-4 h-4 accent-blue-600"
              />
              <span>Activo</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-cyan-600 border border-cyan-600 px-4 py-1 rounded hover:bg-cyan-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
