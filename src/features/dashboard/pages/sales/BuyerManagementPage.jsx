import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from 'react-dom';
import { FaUserPlus, FaEye, FaEdit, FaSearch, FaTrash, FaTimes } from "react-icons/fa";
import "../../../../shared/styles/globals.css"
import BuyerForm from "../../components/sales/BuyerForm";
import BuyerViewModal from "../../components/sales/BuyerView";
import { buyersApiService } from "../../../../shared/services/buyersApiService";

export function BuyersManagementPage() {
    const [compradores, setCompradores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // --- ESTADOS DE ACCION ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [buyerToEdit, setBuyerToEdit] = useState(null);
    const [buyerToView, setBuyerToView] = useState(null);
    const [buyerToDelete, setBuyerToDelete] = useState(null);

    const showStatus = (type, message) => {
        setStatusMessage({ type, message });
    };

    const fetchBuyers = useCallback(async (query = "") => {
        try {
            setIsLoading(true);
            const params = query ? { search: query } : {};
            const buyers = await buyersApiService.getAll(params);
            setCompradores(buyers);
        } catch (error) {
            showStatus("error", error.message || "No fue posible cargar los compradores");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuyers();
    }, [fetchBuyers]);

    useEffect(() => {
        const trimmed = searchTerm.trim();
        const timeoutId = setTimeout(() => {
            fetchBuyers(trimmed);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchBuyers]);

// --- FILTRO DE BÚSQUEDA ---
    const filteredBuyers = compradores;

    // --- HANDLERS GENERALES ---
    const handleCloseForm = () => {
        setShowForm(false);
        setBuyerToEdit(null);
    };

    const handleCloseViewModal = () => {
        setBuyerToView(null);
    };

    // --- HANDLERS CREAR/EDITAR/VER ---
    const handleNewClick = () => {
        setBuyerToEdit(null);
        setShowForm(true);
    };
    
    const handleEditClick = (buyer) => {
        setBuyerToEdit(buyer);
        setShowForm(true);
    };

    const handleViewClick = (buyer) => {
        setBuyerToView(buyer);
    };

    const handleCreateBuyer = async (formData) => {
        try {
            setFormSubmitting(true);
            const newBuyer = await buyersApiService.create(formData);
            setCompradores((prev) => [newBuyer, ...prev.filter((buyer) => buyer.id !== newBuyer.id)]);
            showStatus("success", "Comprador registrado correctamente");
            handleCloseForm();
        } catch (error) {
            showStatus("error", error.message || "No fue posible crear el comprador");
            throw error;
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleUpdateBuyer = async (formData) => {
        if (!buyerToEdit) return;
        const targetId = buyerToEdit.id || buyerToEdit.personaId;
        if (!targetId) {
            showStatus("error", "No se pudo determinar el identificador del comprador a actualizar.");
            return;
        }

        try {
            setFormSubmitting(true);
            const updatedBuyer = await buyersApiService.update(targetId, formData);
            setCompradores((prev) =>
                prev.map((buyer) => (buyer.id === updatedBuyer.id ? updatedBuyer : buyer))
            );
            showStatus("success", "Comprador actualizado correctamente");
            handleCloseForm();
        } catch (error) {
            showStatus("error", error.message || "No fue posible actualizar el comprador");
            throw error;
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleSubmit = (formData) => {
        if (buyerToEdit) {
            return handleUpdateBuyer(formData);
        }
        return handleCreateBuyer(formData);
    };

    // --- HANDLERS ELIMINAR ---
    const handleDeleteRequest = (buyer) => {
        setBuyerToDelete(buyer);
    };

    const handleCancelDelete = () => {
        setBuyerToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!buyerToDelete) return;
        const targetId = buyerToDelete.id || buyerToDelete.personaId;
        if (!targetId) {
            showStatus("error", "No se pudo determinar el identificador del comprador a eliminar.");
            return;
        }

        try {
            setIsDeleting(true);
            const removedBuyer = await buyersApiService.delete(targetId);
            const removedId = removedBuyer?.id ?? targetId;
            setCompradores((prev) =>
                prev.filter((b) => (b.id ?? b.personaId) !== removedId)
            );
            showStatus("success", "Comprador eliminado correctamente");
        } catch (error) {
            showStatus("error", error.message || "No fue posible eliminar al comprador");
        } finally {
            setIsDeleting(false);
            setBuyerToDelete(null);
        }
    };

    // --- FUNCIÓN PARA RENDERIZAR EL FORMULARIO COMO MODAL CON PORTAL ---
    const renderFormModal = () => {
        if (!showForm) return null;

        const modalContent = (
            <BuyerForm
                onSubmit={handleSubmit}
                onClose={handleCloseForm}
                nextId={buyerToEdit ? buyerToEdit.id : compradores.length + 1}
                initialData={buyerToEdit}
                isSubmitting={formSubmitting}
            />
        );

        return ReactDOM.createPortal(
            modalContent,
            document.getElementById('modal-root') || document.body
        );
    };

    // --- FUNCIÓN PARA RENDERIZAR EL MODAL DE VISUALIZACIÓN CON PORTAL ---
    const renderViewModal = () => {
        if (!buyerToView) return null;

        const modalContent = (
            <BuyerViewModal buyer={buyerToView} onClose={handleCloseViewModal} />
        );

        return ReactDOM.createPortal(
            modalContent,
            document.getElementById('modal-root') || document.body
        );
    };

    // --- FUNCIÓN INTERNA PARA RENDERIZAR EL MODAL DE ELIMINACIÓN ---
    const renderDeleteModal = () => {
        if (!buyerToDelete) return null;

        const modalContent = (
            <div 
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleCancelDelete} 
            >
                <div
                    className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                        <FaTrash /> Confirmar Eliminación
                    </h3>
                    <p className="mb-6 text-gray-700">
                        ¿Estás seguro de que deseas eliminar a
                        <span className="font-extrabold text-purple-700"> {buyerToDelete.primerNombre} {buyerToDelete.primerApellido}</span>
                        ? Esta acción es irreversible.
                    </p>
                    
                    <div className="flex justify-end gap-3 pt-3 border-t">
                        <button
                            onClick={handleCancelDelete}
                            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-xl font-semibold hover:bg-gray-400 transition duration-150"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className={`bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition duration-150 shadow-md flex items-center gap-2 ${
                                isDeleting ? "opacity-70 cursor-not-allowed" : "hover:bg-red-700"
                            }`}
                        >
                            {!isDeleting && <FaTimes />}
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </div>
        );

        return ReactDOM.createPortal(
            modalContent,
            document.getElementById('modal-root') || document.body 
        );
    };

    // --- RENDERIZADO PRINCIPAL ---
    return (
        <>
            <div className="p-6">
                {statusMessage && (
                    <div
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold ${
                            statusMessage.type === "error"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-green-200 bg-green-50 text-green-800"
                        }`}
                    >
                        {statusMessage.message}
                    </div>
                )}

                {/* HEADER CON ESTILO DEL BANNER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Gestión de compradores
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Administra toda la información de tus compradores
                    </p>
                </div>

                {/* CONTENEDOR SUPERIOR CON BOTÓN */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 max-w-md">
                        {/* BARRA DE BÚSQUEDA */}
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar comprador por nombre, apellido, doc, correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-150 shadow-sm"
                            />
                        </div>
                    </div>
                    
                    {/* BOTÓN CON COLOR AZUL COMO EL BANNER */}
                    <button
                        onClick={handleNewClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition duration-200 font-semibold"
                    >
                        <FaUserPlus className="text-lg" /> Crear comprador
                    </button>
                </div>

                {/* TABLA */}
                <div className="rent-table-wrapper rounded-xl shadow-lg">
                    {/* CABECERA DE TABLA CON COLOR AZUL */}
                    <div className="rent-table-header rounded-t-xl bg-blue-700">
                        👥 Lista de compradores ({filteredBuyers.length}{" "}
                        {filteredBuyers.length === 1 ? "resultado" : "resultados"})
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="rent-table w-full border-collapse bg-white rounded-b-lg overflow-hidden">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-3 py-3 text-center border-0">ID</th>
                                    <th className="px-3 py-3 text-center border-0">Tipo doc</th>
                                    <th className="px-3 py-3 text-center border-0">#Documento</th>
                                    <th className="px-3 py-3 text-center border-0">Primer nombre</th>
                                    <th className="px-3 py-3 text-center border-0">Segundo nombre</th>
                                    <th className="px-3 py-3 text-center border-0">Primer apellido</th>
                                    <th className="px-3 py-3 text-center border-0">Segundo apellido</th>
                                    <th className="px-3 py-3 text-center border-0">Correo</th>
                                    <th className="px-3 py-3 text-center border-0">Teléfono</th>
                                    <th className="px-3 py-3 text-center border-0">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-6 text-center text-gray-500 border-0"
                                        >
                                            Cargando compradores...
                                        </td>
                                    </tr>
                                ) : filteredBuyers.length > 0 ? (
                                    filteredBuyers.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-gray-50 border-t border-gray-200"
                                        >
                                            <td className="px-3 py-3 text-center border-0">{c.id}</td>
                                            <td className="px-3 py-3 text-center border-0">{c.tipoDocumento}</td>
                                            <td className="px-3 py-3 text-center border-0">{c.documento}</td>
                                            <td className="px-3 py-3 text-center border-0">{c.primerNombre}</td>
                                            <td className="px-3 py-3 text-center border-0">
                                                {c.segundoNombre || "-"}
                                            </td>
                                            <td className="px-3 py-3 text-center border-0">{c.primerApellido}</td>
                                            <td className="px-3 py-3 text-center border-0">
                                                {c.segundoApellido || "-"}
                                            </td>
                                            <td className="px-3 py-3 text-center border-0 truncate">
                                                <a
                                                    href={`mailto:${c.correo}`}
                                                    className="text-blue-600 underline hover:text-blue-800"
                                                >
                                                    {c.correo}
                                                </a>
                                            </td>
                                            <td className="px-3 py-3 text-center border-0">{c.telefono}</td>
                                            <td className="px-3 py-3 text-center flex gap-2 justify-center border-0">
                                                <button
                                                    aria-label="Editar comprador"
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    onClick={() => handleEditClick(c)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    aria-label="Ver comprador"
                                                    className="text-sky-600 hover:text-sky-800 transition-colors"
                                                    onClick={() => handleViewClick(c)}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    aria-label="Eliminar comprador"
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                    onClick={() => handleDeleteRequest(c)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-6 text-center text-gray-500 border-0"
                                        >
                                            No se encontraron compradores.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODALES CON PORTAL - TODOS SE RENDERIZAN EN EL MISMO SITIO */}
            {renderFormModal()}
            {renderViewModal()}
            {renderDeleteModal()}
        </>
    );
}
