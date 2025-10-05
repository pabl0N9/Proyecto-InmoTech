import React, { useState } from "react";

export default function PurchaseTrackingModal({ venta, onClose, onUpdate }) {
  if (!venta) return null;

  // Estado local editable
  const [estado, setEstado] = useState(venta.estado || "Pendiente");
  const [estadoSeguimiento, setEstadoSeguimiento] = useState(
    venta.estadoSeguimiento || "Iniciado"
  );

  const handleSave = () => {
    const updatedVenta = {
      ...venta,
      estado,
      estadoSeguimiento,
    };
    onUpdate(updatedVenta);
    onClose();
  };

  // 🔹 Estilos dinámicos para el estado
  const getEstadoStyle = (estado) => {
    switch (estado) {
      case "Pagado":
        return "bg-green-100 text-green-700 border border-green-400";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700 border border-yellow-400";
      case "Debe":
        return "bg-red-100 text-red-700 border border-red-400";
      default:
        return "bg-gray-100 text-gray-700 border";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto p-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold">Seguimiento de la compra</h2>
          <button
            className="text-gray-600 hover:text-gray-900 text-lg"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Datos básicos */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={venta.registro || ""}
            readOnly
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={venta.tipo || ""}
            readOnly
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={venta.comprador || ""}
            readOnly
            className="border p-2 rounded col-span-2"
          />
          <input
            type="text"
            value={venta.fecha || ""}
            readOnly
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={venta.valor || ""}
            readOnly
            className="border p-2 rounded"
          />
        </div>

        {/* Estado editable */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className={`p-2 rounded w-full font-semibold cursor-pointer ${getEstadoStyle(
              estado
            )}`}
          >
            <option value="Pagado" className="bg-green-100 text-green-700">
              Pagado
            </option>
            <option value="Pendiente" className="bg-yellow-100 text-yellow-700">
              Pendiente
            </option>
            <option value="Debe" className="bg-red-100 text-red-700">
              Debe
            </option>
          </select>
        </div>

        {/* Seguimiento */}
        <div className="mb-4 border p-3 rounded">
          <p>
            <strong>Responsable:</strong> {venta.responsable || "Admin"}
          </p>
          <label className="block font-semibold mt-2">
            Estado del seguimiento
          </label>
          <select
            value={estadoSeguimiento}
            onChange={(e) => setEstadoSeguimiento(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="Iniciado">Iniciado</option>
            <option value="En proceso">En proceso</option>
            <option value="Completado">Completado</option>
          </select>
          <p className="mt-2">
            <strong>Fecha:</strong> {venta.fechaSeguimiento || "22/05/2025"}
          </p>
          <p>
            <strong>Descripción:</strong>{" "}
            {venta.descripcionSeguimiento || "Documentación en revisión"}
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
