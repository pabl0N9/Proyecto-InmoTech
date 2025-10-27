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

      {/* Código de Empleado y Fecha de Ingreso */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigoEmpleado" className="text-sm font-medium text-slate-700">
            Código de Empleado *
          </Label>
          <Input
            id="codigoEmpleado"
            type="text"
            value={formData.codigoEmpleado}
            onChange={(e) => updateFormData('codigoEmpleado', e.target.value)}
            className={`h-10 ${errors.codigoEmpleado ? 'border-red-500' : ''}`}
            placeholder="EMP-001"
          />
          {errors.codigoEmpleado && (
            <p className="text-sm text-red-600">{errors.codigoEmpleado}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaIngreso" className="text-sm font-medium text-slate-700">
            Fecha de Ingreso *
          </Label>
          <Input
            id="fechaIngreso"
            type="date"
            value={formData.fechaIngreso}
            onChange={(e) => updateFormData('fechaIngreso', e.target.value)}
            className={`h-10 ${errors.fechaIngreso ? 'border-red-500' : ''}`}
          />
          {errors.fechaIngreso && (
            <p className="text-sm text-red-600">{errors.fechaIngreso}</p>
          )}
        </div>
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

      {/* Salario */}
      <div className="space-y-2">
        <Label htmlFor="salario" className="text-sm font-medium text-slate-700">
          Salario Mensual
        </Label>
        <Input
          id="salario"
          type="number"
          value={formData.salario}
          onChange={(e) => updateFormData('salario', e.target.value)}
          className={`h-10 ${errors.salario ? 'border-red-500' : ''}`}
          placeholder="2000000"
          min="0"
          step="0.01"
        />
        {errors.salario && (
          <p className="text-sm text-red-600">{errors.salario}</p>
        )}
        <p className="text-xs text-slate-500">
          Ingresa el salario mensual en pesos colombianos (opcional).
        </p>
      </div>
    </div>
  );
};

export default LaboralStep;