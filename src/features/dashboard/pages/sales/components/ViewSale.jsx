import React from "react";
import EstadoBadge from "./EstadoBadge";

export default function ViewSaleModal({ sale, onClose }) {
  if (!sale) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Detalle de la Venta</h2>

        {/* Datos generales */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Información general</h3>
          <p><strong>ID:</strong> {sale.id}</p>
          <p><strong>Registro:</strong> {sale.registro}</p>
          <p><strong>Tipo:</strong> {sale.tipo}</p>
          <p><strong>Fecha:</strong> {sale.fecha}</p>
          <p><strong>Valor:</strong> {sale.valor}</p>
          <p><strong>Estado:</strong> <EstadoBadge estado={sale.estado} /></p>
          <p><strong>Seguimiento:</strong> {sale.estadoSeguimiento}</p>
        </div>

        {/* Comprador */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Información del comprador</h3>
          <p><strong>Tipo de documento:</strong> {sale.compradorTipoDocumento}</p>
          <p><strong>Documento:</strong> {sale.compradorDocumento}</p>
          <p><strong>Nombre:</strong> {sale.compradorNombreCompleto}</p>
          <p><strong>Correo:</strong> {sale.compradorCorreo}</p>
          <p><strong>Teléfono:</strong> {sale.compradorTelefono}</p>
        </div>

        {/* Vendedor */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Información del vendedor</h3>
          <p><strong>Tipo de documento:</strong> {sale.vendedorTipoDocumento}</p>
          <p><strong>Documento:</strong> {sale.vendedorDocumento}</p>
          <p><strong>Nombre:</strong> {sale.vendedorNombreCompleto}</p>
          <p><strong>Correo:</strong> {sale.vendedorCorreo}</p>
          <p><strong>Teléfono:</strong> {sale.vendedorTelefono}</p>
        </div>

        {/* Inmueble */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Información del inmueble</h3>
          <p><strong>Tipo:</strong> {sale.inmuebleTipo}</p>
          <p><strong>Registro:</strong> {sale.inmuebleRegistro}</p>
          <p><strong>Nombre:</strong> {sale.inmuebleNombre}</p>
          <p><strong>Área:</strong> {sale.inmuebleArea} m²</p>
          <p><strong>Habitaciones:</strong> {sale.inmuebleHabitaciones}</p>
          <p><strong>Baños:</strong> {sale.inmuebleBanos}</p>
          <p><strong>Garaje:</strong> {sale.inmuebleGaraje}</p>
          <p><strong>Estrato:</strong> {sale.inmuebleEstrato}</p>
          <p><strong>Dirección:</strong> {sale.inmuebleDireccion}</p>
          <p><strong>Barrio:</strong> {sale.inmuebleBarrio}</p>
          <p><strong>Ciudad:</strong> {sale.inmuebleCiudad}</p>
          <p><strong>Departamento:</strong> {sale.inmuebleDepartamento}</p>
          <p><strong>País:</strong> {sale.inmueblePais}</p>
          <p><strong>Precio:</strong> {sale.inmueblePrecio} $</p>
          <p><strong>Estado:</strong> {sale.inmuebleEstado}</p>
        </div>

        {/* Botón de cierre */}
        <div className="mt-6 text-right">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
