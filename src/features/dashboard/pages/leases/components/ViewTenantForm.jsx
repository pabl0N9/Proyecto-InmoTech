import React from "react";
import { FaTimes, FaImage } from "react-icons/fa";

export default function ViewTenantModal({ tenant, onClose }) {
  if (!tenant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        
        {/* Encabezado */}
        <header className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold">Información del arrendatario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            <FaTimes />
          </button>
        </header>

        {/* Contenido */}
        <div className="text-sm space-y-2 mb-6 max-h-[70vh] overflow-y-auto pr-3">
          <p><strong>Tipo de documento:</strong> {tenant.tipo || "-"}</p>
          <p><strong>Número de documento:</strong> {tenant.documento || "-"}</p>
          <p><strong>Primer nombre:</strong> {tenant.primerNombre || "-"}</p>
          <p><strong>Segundo nombre:</strong> {tenant.segundoNombre || "-"}</p>
          <p><strong>Primer apellido:</strong> {tenant.primerApellido || "-"}</p>
          <p><strong>Segundo apellido:</strong> {tenant.segundoApellido || "-"}</p>
          <p>
            <strong>Correo:</strong>{" "}
            {tenant.correo ? (
              <span className="text-blue-600 underline">{tenant.correo}</span>
            ) : (
              "-"
            )}
          </p>
          <p><strong>Teléfono:</strong> {tenant.telefono || "-"}</p>

          {/* Sección inmuebles arrendados */}
          <p className="font-bold pt-3">Inmuebles arrendados:</p>
          {tenant.inmueblesArrendados && tenant.inmueblesArrendados.length > 0 ? (
            tenant.inmueblesArrendados.map((inmueble, index) => (
              <div key={index} className="pt-3 pb-3 border-t">
                <div className="flex items-start gap-4 mb-2">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <FaImage size={30} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-base mb-1">{inmueble.nombre}</p>
                    <div className="flex space-x-4 text-sm text-gray-700">
                      <p>m²: <span className="font-semibold">{inmueble.m2}</span></p>
                      <p>Hab: <span className="font-semibold">{inmueble.hab}</span></p>
                      <p>Baños: <span className="font-semibold">{inmueble.baños}</span></p>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-1 pl-4">
                  <p><strong>Registro inmobiliario:</strong> {inmueble.registro}</p>
                  <p><strong>Dirección:</strong> {inmueble.direccion}</p>
                  <div className="flex justify-between items-center pr-10">
                    <p><strong>Tipo inmueble:</strong> {inmueble.tipo}</p>
                    <p>
                      <strong>Estado:</strong>
                      <span
                        className={`font-semibold ml-1 ${
                          inmueble.estado === "Activo"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {inmueble.estado}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic text-sm">
              No hay inmuebles registrados para este arrendatario.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
