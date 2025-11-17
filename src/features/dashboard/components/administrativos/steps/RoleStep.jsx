import React, { useState, useEffect } from 'react';
import { Label } from '../../../../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/select';
import rolesApiService from '../../../../../shared/services/rolesApiService';

const RoleStep = ({ formData, errors, updateFormData }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await rolesApiService.obtenerRoles();
        // Filtrar solo roles administrativos
        const rolesAdministrativos = roles.filter(rol => rol.es_administrativo || rol.es_rol_administrativo);
        // Orden especial: Super Administrador (ID 1) y Administrador (ID 2) primero, luego el resto por ID
        const rolesSorted = rolesAdministrativos.sort((a, b) => {
          // Super Administrador siempre primero
          if (a.id == 1) return -1;
          if (b.id == 1) return 1;

          // Administrador siempre segundo
          if (a.id == 2) return -1;
          if (b.id == 2) return 1;

          // Resto ordenados por ID
          return parseInt(a.id, 10) - parseInt(b.id, 10);
        });
        setRoles(rolesSorted);
      } catch (error) {
        console.error('Error cargando roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Rol Administrativo</h3>
        <p className="text-slate-600 text-sm">Selecciona el rol que tendrá este administrativo en el sistema</p>
      </div>

      {/* Selección de Rol */}
      <div className="space-y-2">
        <Label htmlFor="rol" className="text-sm font-medium text-slate-700">
          Rol Administrativo *
        </Label>
        <Select
          value={formData.rol}
          onValueChange={(value) => updateFormData('rol', value)}
          disabled={loading}
        >
          <SelectTrigger className={`h-10 ${errors.rol ? 'border-red-500' : ''}`}>
            <SelectValue placeholder={loading ? "Cargando roles..." : "Seleccionar rol"} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((rol) => (
              <SelectItem key={rol.id_rol || rol.id} value={(rol.id_rol || rol.id).toString()}>
                {rol.nombre_rol}
                {rol.descripcion && (
                  <span className="text-xs text-slate-500 ml-2">
                    - {rol.descripcion}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.rol && (
          <p className="text-sm text-red-600">{errors.rol}</p>
        )}
      </div>

      {/* Información del rol seleccionado */}
      {formData.rol && roles.length > 0 && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">Información del Rol</h4>
          {(() => {
            const selectedRol = roles.find(r => (r.id_rol || r.id).toString() === formData.rol);
            return selectedRol ? (
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Nombre:</strong> {selectedRol.nombre_rol}</p>
                {selectedRol.descripcion && (
                  <p><strong>Descripción:</strong> {selectedRol.descripcion}</p>
                )}
                <p><strong>Tipo:</strong> Rol Administrativo</p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Lista de roles disponibles */}
      <div className="mt-6">
        <h4 className="font-medium text-slate-800 mb-3">Roles Administrativos Disponibles</h4>
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando roles...</p>
          ) : roles.length > 0 ? (
            roles.map((rol) => (
              <div
                key={rol.id_rol}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.rol === rol.id_rol.toString()
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => updateFormData('rol', rol.id_rol.toString())}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{rol.nombre_rol}</p>
                    {rol.descripcion && (
                      <p className="text-sm text-slate-600">{rol.descripcion}</p>
                    )}
                  </div>
                  {formData.rol === rol.id_rol.toString() && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No hay roles administrativos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleStep;
