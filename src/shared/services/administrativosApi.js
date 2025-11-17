export async function listarAdministrativos({ estado_laboral = 'Activo', departamento, cargo, page = 1, pageSize = 10 } = {}) {
    // ... existing code ...
    const params = new URLSearchParams({ estado_laboral, page, pageSize });
    if (departamento) params.append('departamento', departamento);
    if (cargo) params.append('cargo', cargo);

    const res = await fetch(`/api/reportes/administrativos?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error al listar administrativos');
    return res.json(); // { items, total, page, pageSize }
    // ... existing code ...
}