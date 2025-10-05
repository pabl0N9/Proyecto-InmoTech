import React from "react";
import { FaImage } from "react-icons/fa";

export default function BuyerView({ buyer, onClose }) {
  if (!buyer) return null; // No renderizar si no hay datos de comprador

  return (
    // Contenedor del modal (fondo oscuro)
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Contenido principal del modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        
        {/* Título y botón cerrar */}
        <header className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold">Información del comprador</h2>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 text-xl"
            >
                ✖
            </button>
        </header>

        {/* --- Sección de Información Personal --- */}
        <div className="text-sm space-y-2 mb-6 max-h-[70vh] overflow-y-auto pr-3">
            
            {/* Campos de la información personal (siguiendo el orden de la imagen) */}
            <p><strong>Tipo de documento:</strong> {buyer.tipoDocumento}</p>
            <p><strong>Número de documento:</strong> {buyer.documento}</p>
            <p><strong>Primer nombre:</strong> {buyer.primerNombre}</p>
            <p><strong>Segundo nombre:</strong> {buyer.segundoNombre || '-'}</p>
            <p><strong>Primer apellido:</strong> {buyer.primerApellido}</p>
            <p><strong>Segundo apellido:</strong> {buyer.segundoApellido || '-'}</p>
            <p><strong>Correo:</strong> <span className="text-blue-600 underline">{buyer.correo}</span></p>
            <p><strong>Teléfono:</strong> {buyer.telefono}</p>
            <p className="font-bold pt-3">Inmuebles comprados:</p>
            
            {/* --- Renderizado de Inmuebles Comprados --- */}
            {buyer.inmueblesComprados && buyer.inmueblesComprados.length > 0 ? (
                buyer.inmueblesComprados.map((inmueble, index) => (
                    <div key={index} className="pt-3 pb-3 border-t">
                        
                        {/* Fila principal del inmueble: Imagen y Títulos */}
                        <div className="flex items-start gap-4 mb-2">
                            {/* Placeholder de Imagen */}
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                <FaImage size={30} /> 
                            </div>
                            
                            {/* Nombre y datos clave */}
                            <div className="flex-grow">
                                <p className="font-bold text-base mb-1">{inmueble.nombre}</p>
                                <div className="flex space-x-4 text-sm text-gray-700">
                                    <p>m²: <span className="font-semibold">{inmueble.m2}</span></p>
                                    <p>Hab: <span className="font-semibold">{inmueble.hab}</span></p>
                                    <p>Baños: <span className="font-semibold">{inmueble.baños}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Información secundaria del inmueble */}
                        <div className="text-sm space-y-1 pl-4">
                            <p><strong>Registro inmobiliario:</strong> {inmueble.registro}</p>
                            <p><strong>Dirección:</strong> {inmueble.direccion}</p>
                            <div className="flex justify-between items-center pr-10">
                                <p><strong>Tipo inmueble:</strong> {inmueble.tipo}</p>
                                <p>
                                    <strong>Estado:</strong> 
                                    <span className={`font-semibold ml-1 ${inmueble.estado === 'Activo' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {inmueble.estado}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 italic text-sm">No hay inmuebles registrados para este comprador.</p>
            )}
        </div>
        
        {/* Pie del modal (MODIFICADO: Botón Cerrar en color morado) */}
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