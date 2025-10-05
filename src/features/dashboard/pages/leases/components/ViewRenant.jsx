import React from "react";
import { FaTimes, FaImage } from "react-icons/fa";

export default function ViewRenant({ renant, onClose }) {
  if (!renant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        
        {/* Encabezado */}
        <header className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold">Información del arriendo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            <FaTimes />
          </button>
        </header>

        {/* Contenido */}
        <div className="text-sm space-y-2 mb-6 max-h-[70vh] overflow-y-auto pr-3">
          <p><strong>ID:</strong> {renant.id}</p>
          <p><strong>Tipo doc inquilino:</strong> {renant.tipoDocInquilino}</p>
          <p><strong>Documento:</strong> {renant.numeroDocInquilino}</p>
          <p><strong>Nombre inquilino:</strong> {renant.primerNombreInquilino} {renant.primerApellidoInquilino}</p>
          <p><strong>Teléfono:</strong> {renant.telefonoInquilino}</p>
          <p><strong>Correo:</strong> {renant.correoInquilino}</p>

          <p className="font-bold pt-3">Codeudor:</p>
          <p><strong>Tipo doc codeudor:</strong> {renant.tipoDocCodeudor}</p>
          <p><strong>Documento:</strong> {renant.numeroDocCodeudor}</p>
          <p><strong>Nombre codeudor:</strong> {renant.primerNombreCodeudor} {renant.primerApellidoCodeudor}</p>
          <p><strong>Teléfono:</strong> {renant.telefonoCodeudor}</p>
          <p><strong>Correo:</strong> {renant.correoCodeudor}</p>

          {/* Inmueble */}
          <p className="font-bold pt-3">Inmueble arrendado:</p>
          <div className="pt-3 pb-3 border-t">
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <FaImage size={30} />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-base mb-1">{renant.nombreInmueble}</p>
                <div className="flex space-x-4 text-sm text-gray-700">
                  <p>m²: <span className="font-semibold">{renant.area}</span></p>
                  <p>Hab: <span className="font-semibold">{renant.habitaciones}</span></p>
                  <p>Baños: <span className="font-semibold">{renant.banos}</span></p>
                </div>
              </div>
            </div>
            <div className="text-sm space-y-1 pl-4">
              <p><strong>Registro inmobiliario:</strong> {renant.registroInmobiliario}</p>
              <p><strong>Dirección:</strong> {renant.direccion}</p>
              <div className="flex justify-between items-center pr-10">
                <p><strong>Tipo inmueble:</strong> {renant.tipoInmueble}</p>
                <p>
                  <strong>Estado:</strong>
                  <span
                    className={`font-semibold ml-1 ${
                      renant.estado === "Pagado" || renant.estado === "Activo"
                        ? "text-green-600"
                        : renant.estado === "Pendiente"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {renant.estado}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Información del contrato */}
          <p className="font-bold pt-3">Contrato:</p>
          <p><strong>Inicio:</strong> {renant.fechaInicio}</p>
          <p><strong>Final:</strong> {renant.fechaFinal}</p>
          <p><strong>Fecha cobro:</strong> {renant.fechaCobro}</p>
          <p><strong>Fecha límite pago:</strong> {renant.fechaLimite}</p>
          <p><strong>Valor mensual:</strong> {renant.valorMensual}</p>
          <p><strong>Precio inmueble:</strong> {renant.precioInmueble}</p>
          <p><strong>Precio total:</strong> {renant.precio}</p>
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
