import React from 'react';
import { Label } from '../../../../../shared/components/ui/label';
import { Input } from '../../../../../shared/components/ui/input';
import { Briefcase, Building, DollarSign } from 'lucide-react';

const LaboralEditStep = ({ formData, errors, updateFormData, administrativo }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Editar Información Laboral</h3>
        <p className="text-slate-600 text-sm">Modifica los datos laborales del administrativo</p>
      </div>

      {/* Información del administrativo actual */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Información laboral actual</span>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <p><strong>Código:</strong> {administrativo?.codigo_empleado}</p>
          <p><strong>Fecha de ingreso:</strong> {administrativo?.fecha_ingreso ? new Date(administrativo.fecha_ingreso).toLocaleDateString('es-CO') : 'No registrada'}</p>
          <p><strong>Estado laboral:</strong> {administrativo?.estado_laboral}</p>
        </div>
      </div>

      {/* Cargo */}
      <div className="space-y-2">
        <Label htmlFor="cargo" className="text-sm font-medium text-slate-700">
          Cargo
        </Label>
        <div className="relative">
          <Input
            id="cargo"
            type="text"
            value={formData.cargo}
            onChange={(e) => updateFormData('cargo', e.target.value)}
            className={`h-10 pl-10 ${errors.cargo ? 'border-red-500' : ''}`}
            placeholder="Agente Inmobiliario"
          />
          <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        {errors.cargo && (
          <p className="text-sm text-red-600">{errors.cargo}</p>
        )}
      </div>

      {/* Departamento */}
      <div className="space-y-2">
        <Label htmlFor="departamento" className="text-sm font-medium text-slate-700">
          Departamento
        </Label>
        <div className="relative">
          <Input
            id="departamento"
            type="text"
            value={formData.departamento}
            onChange={(e) => updateFormData('departamento', e.target.value)}
            className={`h-10 pl-10 ${errors.departamento ? 'border-red-500' : ''}`}
            placeholder="Ventas"
          />
          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        {errors.departamento && (
          <p className="text-sm text-red-600">{errors.departamento}</p>
        )}
      </div>

      {/* Salario */}
      <div className="space-y-2">
        <Label htmlFor="salario" className="text-sm font-medium text-slate-700">
          Salario Mensual
        </Label>
        <div className="relative">
          <Input
            id="salario"
            type="number"
            value={formData.salario}
            onChange={(e) => updateFormData('salario', e.target.value)}
            className={`h-10 pl-10 ${errors.salario ? 'border-red-500' : ''}`}
            placeholder="2000000"
            min="0"
            step="0.01"
          />
          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        {errors.salario && (
          <p className="text-sm text-red-600">{errors.salario}</p>
        )}
        <p className="text-xs text-slate-500">
          Ingresa el salario mensual en pesos colombianos.
        </p>
      </div>

      {/* Información adicional */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Información importante</span>
        </div>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• El código de empleado y fecha de ingreso no se pueden modificar</li>
          <li>• El salario es información confidencial, maneja con cuidado</li>
          <li>• Los cambios en cargo y departamento afectan los permisos del usuario</li>
        </ul>
      </div>
    </div>
  );
};

export default LaboralEditStep;