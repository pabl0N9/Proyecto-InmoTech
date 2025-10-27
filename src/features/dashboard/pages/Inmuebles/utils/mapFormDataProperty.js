export const mapFormDataToInmueble = (formData, id, estado = "Disponible") => {
  let firstPhotoUrl = null;
  if (formData.fotos && formData.fotos.length > 0 && formData.fotos[0] instanceof File) {
    firstPhotoUrl = URL.createObjectURL(formData.fotos[0]);
  } else if (formData.fotos && formData.fotos.length > 0 && typeof formData.fotos[0] === "string") {
    firstPhotoUrl = formData.fotos[0];
  }

  const serializableFotos = (formData.fotos || []).map((foto) =>
    foto instanceof File ? `file_placeholder_${foto.name}` : foto
  );

  return {
    id: id,
    firstImage: firstPhotoUrl,
    registro: formData.registroInmobiliario || "N/A",
    direccion: formData.direccion || "N/A",
    propietario: `${formData.primerNombre} ${formData.primerApellido}`.trim(),
    tipo: formData.tipoInmueble,
    operacion: formData.tipoOperacion,
    estado: estado,
    ownerInfo: {
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      primerNombre: formData.primerNombre,
      segundoNombre: formData.segundoNombre,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido,
      correo: formData.correo,
      telefono: formData.telefono,
    },
    propertyInfo: {
      tituloInmueble: formData.tituloInmueble,
      area: formData.area,
      precio: formData.precio,
      banos: formData.banos,
      habitaciones: formData.habitaciones,
      pais: formData.pais,
      estrato: formData.estrato,
      ciudad: formData.ciudad,
      departamento: formData.departamento,
      barrio: formData.barrio,
      garaje: formData.garaje ? "Sí" : "No",
      cantidadGaraje: formData.cantidadGaraje,
      fotos: serializableFotos,
    },
    historial: [
      {
        fechaEdicion: new Date().toISOString(),
        editor: "Sistema Inicial",
        datos: { ...formData, fotos: serializableFotos },
      },
    ],
  };
};
