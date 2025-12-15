import React from 'react';
import { Label } from '../../../../../shared/components/ui/label';
import { Input } from '../../../../../shared/components/ui/input';

const LaboralStep = ({ formData, errors, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Información Laboral</h3>
        <p className="text-slate-600 text-sm">Ingresa los datos laborales del nuevo administrativo</p>
      </div>

<<<<<<< HEAD
      {/* Fecha de Ingreso */}
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      <div className="space-y-2">
        <Label htmlFor="fechaIngreso" className="text-sm font-medium text-slate-700">
          Fecha de Ingreso *
        </Label>
        <Input
          id="fechaIngreso"
          type="date"
          value={formData.fechaIngreso}
          onChange={(e) => updateFormData('fechaIngreso', e.target.value)}
<<<<<<< HEAD
          className={`h-10 ${errors.fechaIngreso ? 'border-red-500' : ''}`}
=======
          className={`h-11 rounded-xl ${errors.fechaIngreso ? 'border-red-500' : ''}`}
          max={new Date().toISOString().split('T')[0]}
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
        />
        {errors.fechaIngreso && (
          <p className="text-sm text-red-600">{errors.fechaIngreso}</p>
        )}
        <p className="text-xs text-slate-500">
<<<<<<< HEAD
          El código de empleado se generará automáticamente según el rol asignado.
        </p>
      </div>

      {/* Cargo y Departamento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargo" className="text-sm font-medium text-slate-700">
            Cargo
          </Label>
          <Input
            id="cargo"
            type="text"
            value={formData.cargo}
            onChange={(e) => updateFormData('cargo', e.target.value)}
            className={`h-10 ${errors.cargo ? 'border-red-500' : ''}`}
            placeholder="Agente Inmobiliario"
          />
          {errors.cargo && (
            <p className="text-sm text-red-600">{errors.cargo}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="departamento" className="text-sm font-medium text-slate-700">
            Departamento
          </Label>
          <Input
            id="departamento"
            type="text"
            value={formData.departamento}
            onChange={(e) => updateFormData('departamento', e.target.value)}
            className={`h-10 ${errors.departamento ? 'border-red-500' : ''}`}
            placeholder="Ventas"
          />
          {errors.departamento && (
            <p className="text-sm text-red-600">{errors.departamento}</p>
          )}
        </div>
      </div>
=======
          No se permiten fechas futuras. El código de empleado se generará automáticamente.
        </p>
      </div>
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
    </div>
  );
};

export default LaboralStep;
