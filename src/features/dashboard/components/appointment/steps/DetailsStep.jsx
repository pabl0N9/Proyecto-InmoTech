import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, FileText } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../../shared/components/ui/select';

const DetailsStep = ({ formData, errors, updateFormData, onFieldComplete }) => {
  const servicios = [
    'Avalúos',
    'Gestión de Alquileres',
    'Asesoría Legal'
  ];

  // Refs para los campos
  const propiedadRef = useRef(null);
  const notasRef = useRef(null);
  const estadoRef = useRef(null);

  // Scroll automático a la sección de notas cuando se selecciona un servicio
  useEffect(() => {
    if (formData.servicio && notasRef.current) {
      notasRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [formData.servicio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Detalles de la Cita</h3>
        <p className="text-slate-600">Información adicional sobre la cita</p>
      </div>

      <div className="space-y-6">
        {/* Servicio */}
        <div ref={propiedadRef}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Home className="w-4 h-4 inline mr-2" />
            Servicio *
          </label>
          <Select
            value={formData.servicio}
            onValueChange={(value) => updateFormData('servicio', value)}
          >
            <SelectTrigger
              className={errors.servicio ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              {servicios.map((servicio, index) => (
                <SelectItem key={index} value={servicio}>
                  {servicio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.servicio && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.servicio}
            </motion.p>
          )}
        </div>

        {/* Notas */}
        <div ref={notasRef}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Notas Adicionales
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => updateFormData('notas', e.target.value)}
            placeholder="Información adicional sobre la cita, preferencias del cliente, etc."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
          />
          <p className="text-slate-500 text-sm mt-1">
            Opcional: Agrega cualquier información relevante para la cita
          </p>
        </div>

        {/* Estado de la Cita */}
        <div ref={estadoRef}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estado de la Cita
          </label>
          <Select
            value={formData.estado}
            onValueChange={(value) => updateFormData('estado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programada">Programada</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-slate-500 text-sm mt-1">
            Por defecto se crea como "Programada"
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Recordatorio:</strong> Asegúrate de que la propiedad seleccionada esté disponible para la fecha y hora elegidas.
        </p>
      </div>
    </motion.div>
  );
};

export default DetailsStep;
