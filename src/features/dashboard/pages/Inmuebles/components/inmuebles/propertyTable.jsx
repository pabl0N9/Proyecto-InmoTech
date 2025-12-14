import React from 'react';
import { Building2 } from 'lucide-react';
import { ActionButtons } from './actionButton';
import { getEstadoColor, getEstadoDotColor } from '../../utils/helpers';

export const PropertyTable = ({ properties, onView, onEdit, onDocument }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Imagen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Registro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Dirección</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Operación</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="w-10 h-10 text-gray-300" />
                    <p className="text-gray-500 font-medium">No se encontraron inmuebles</p>
                    <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((property) => {
                const coverImage = property.imagenes?.[0];
                const fallback = property.titulo?.[0]?.toUpperCase() || property.tipo?.[0] || 'I';

                return (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={`Imagen de ${property.titulo || property.registro}`}
                          className="h-12 w-16 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-semibold">
                          {fallback}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">#{property.id}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 font-mono">{property.registro}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 truncate max-w-[220px]">{property.direccion}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {property.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{property.operacion}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${getEstadoColor(property.estado)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getEstadoDotColor(property.estado)}`}></span>
                        {property.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => onView(property)}
                        onEdit={() => onEdit(property)}
                        onDocument={() => onDocument(property)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
