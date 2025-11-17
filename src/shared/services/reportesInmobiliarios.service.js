import axios from 'axios'

const API_BASE_URL = import.meta.env?.VITE_API_URL?.trim() || 'http://localhost:5000/api/v1'

const client = axios.create({
  baseURL: `${API_BASE_URL}/reportes-inmobiliarios`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('inmotech_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.message === 'Network Error' || !error.response) {
      throw new Error('No se pudo conectar al API de reportes.')
    }
    const msg = error.response?.data?.message || error.response?.data?.error || error.message
    throw new Error(msg)
  }
)

const unwrap = (response) => {
  if (!response) return null
  return response.data?.data ?? response.data
}

export const reportesInmobiliariosService = {
  async listarReportes(params = {}) {
    const res = await client.get('/', { params })
    return unwrap(res)
  },
  async crearReporte(payload) {
    const res = await client.post('/', payload)
    return unwrap(res)
  },
  async actualizarReporte(id, payload) {
    const res = await client.put(`/${id}`, payload)
    return unwrap(res)
  },
  async eliminarReporte(id) {
    const res = await client.delete(`/${id}`)
    return unwrap(res)
  },
}