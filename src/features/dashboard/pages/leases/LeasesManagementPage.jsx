import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { FaUserPlus, FaEye, FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import "../../../../shared/styles/globals.css";
import LeasesPersonForm from "../../components/leases/TenantForm";
import ViewTenantModal from "../../components/leases/ViewTenantForm";
import { renantsApiService } from "../../../../shared/services/arrendatarioApiService";

export function LeasesManagementPage() {
  const [arrendatarios, setArrendatarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);
  const [tenantToView, setTenantToView] = useState(null);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const tenants = await renantsApiService.getAll();
      setArrendatarios(tenants);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error.message || "No fue posible obtener los arrendatarios"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    if (!searchTerm.trim()) return arrendatarios;
    const lower = searchTerm.toLowerCase();
    return arrendatarios.filter((tenant) => {
      return (
        tenant.primerNombre.toLowerCase().includes(lower) ||
        (tenant.segundoNombre && tenant.segundoNombre.toLowerCase().includes(lower)) ||
        tenant.primerApellido.toLowerCase().includes(lower) ||
        (tenant.segundoApellido && tenant.segundoApellido.toLowerCase().includes(lower)) ||
        tenant.documento.includes(searchTerm) ||
        tenant.correo.toLowerCase().includes(lower) ||
        tenant.telefono.includes(searchTerm)
      );
    });
  }, [arrendatarios, searchTerm]);

  const handleCloseForm = () => {
    setShowForm(false);
    setTenantToEdit(null);
  };

  const handleCreateTenant = async (formData) => {
    setFormSubmitting(true);
    try {
      const newTenant = await renantsApiService.create(formData);
      setArrendatarios((prev) => [newTenant, ...prev]);
      setStatusMessage({ type: "success", message: "Arrendatario creado correctamente" });
      handleCloseForm();
    } catch (error) {
      setStatusMessage({ type: "error", message: error.message || "No fue posible crear el arrendatario" });
      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateTenant = async (formData) => {
    if (!tenantToEdit) return;
    setFormSubmitting(true);
    try {
      const updated = await renantsApiService.update(tenantToEdit.id, formData);
      setArrendatarios((prev) => prev.map((tenant) => (tenant.id === updated.id ? updated : tenant)));
      setStatusMessage({ type: "success", message: "Arrendatario actualizado correctamente" });
      handleCloseForm();
    } catch (error) {
      setStatusMessage({ type: "error", message: error.message || "No fue posible actualizar el arrendatario" });
      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSubmit = (formData) => {
    if (tenantToEdit) {
      return handleUpdateTenant(formData);
    }
    return handleCreateTenant(formData);
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    try {
      const removedTenant = await renantsApiService.delete(tenantToDelete.id);
      const removedId = removedTenant?.id ?? tenantToDelete.id;
      setArrendatarios((prev) => prev.filter((tenant) => tenant.id !== removedId));
      setStatusMessage({ type: "success", message: "Arrendatario eliminado correctamente" });
    } catch (error) {
      setStatusMessage({ type: "error", message: error.message || "No fue posible eliminar al arrendatario" });
    } finally {
      setTenantToDelete(null);
    }
  };

  const renderFormModal = () => {
    if (!showForm) return null;

    const modalContent = (
      <LeasesPersonForm
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
        nextId={arrendatarios.length + 1}
        initialData={tenantToEdit}
        isSubmitting={formSubmitting}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root") || document.body
    );
  };

  const renderViewModal = () => {
    if (!tenantToView) return null;
    const modalContent = (
      <ViewTenantModal tenant={tenantToView} onClose={() => setTenantToView(null)} />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root") || document.body
    );
  };

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de arrendatarios</h1>
          <p className="text-gray-600 text-lg">
            Administra la información de tus arrendatarios, contratos y propiedades vinculadas.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar arrendatario por nombre, documento, correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-150 shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setTenantToEdit(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition duration-200 font-semibold"
          >
            <FaUserPlus className="text-lg" /> Crear arrendatario
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        <div className="rent-table-wrapper rounded-xl shadow-lg">
          <div className="rent-table-header rounded-t-xl bg-blue-700">
            ¿ Lista de arrendatarios ({filteredTenants.length}{" "}
            {filteredTenants.length === 1 ? "resultado" : "resultados"})
          </div>

          <div className="overflow-x-auto">
            <table className="rent-table w-full border-collapse bg-white rounded-b-lg overflow-hidden">
              <thead className="bg-green-50">
                <tr>
                  <th>Arrendatario</th>
                  <th>Documento</th>
                  <th>Inmueble</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Cargando arrendatarios...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No se encontraron arrendatarios con el criterio seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-blue-50 transition duration-150">
                      <td className="px-4 py-4">
                        <strong>{tenant.primerNombre} {tenant.primerApellido}</strong>
                        <p className="text-sm text-gray-500">{tenant.correo}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-600">{tenant.tipoDocumento}</span>
                        <p className="text-sm text-gray-500">{tenant.documento}</p>
                      </td>
                      <td className="px-4 py-4">
                        {tenant.inmueblesArrendados && tenant.inmueblesArrendados.length > 0 ? (
                          <div>
                            <p className="font-semibold text-gray-800">{tenant.inmueblesArrendados[0].nombre}</p>
                            <p className="text-sm text-gray-500">{tenant.inmueblesArrendados[0].direccion}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Sin inmuebles</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-600">{tenant.telefono}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
                            tenant.estado === "Activo"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : tenant.estado === "Moroso"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {tenant.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex flex-col gap-2">
                        <button
                          onClick={() => setTenantToView(tenant)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-semibold"
                        >
                          <FaEye /> Ver
                        </button>
                        <button
                          onClick={() => {
                            setTenantToEdit(tenant);
                            setShowForm(true);
                          }}
                          className="text-green-600 hover:text-green-800 flex items-center gap-2 font-semibold"
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          onClick={() => setTenantToDelete(tenant)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-2 font-semibold"
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderFormModal()}
      {renderViewModal()}

      {tenantToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Eliminar arrendatario</h3>
            <p className="text-gray-600 mb-4">
              ¿Confirma que desea eliminar a{" "}
              <strong>{tenantToDelete.primerNombre} {tenantToDelete.primerApellido}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTenantToDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTenant}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
