// config.js - URLs de la API
const getApiUrl = () => {
    // En producción (Vercel), usa tu backend de Railway
    if (import.meta.env.PROD) {
        const url = import.meta.env.VITE_API_URL || 'https://tu-app.railway.app/api';
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }
    // En desarrollo local
    return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = getApiUrl();

// Endpoints específicos
export const ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/token/`,
        refresh: `${API_BASE_URL}/token/refresh/`,
        register: `${API_BASE_URL}/usuarios/`,
    },
    users: `${API_BASE_URL}/usuarios/`,
    eventos: `${API_BASE_URL}/eventos/`,
    inscripciones: `${API_BASE_URL}/inscripciones/`,
    categorias: `${API_BASE_URL}/categorias/`,
    resenas: `${API_BASE_URL}/resenas/`,
    estadisticas: `${API_BASE_URL}/estadisticas/`,
    configuracion: `${API_BASE_URL}/configuracion/perfil/`,
    contacto: `${API_BASE_URL}/contacto/`,
    ubicaciones: `${API_BASE_URL}/ubicaciones/`,
};

export default {
    API_BASE_URL,
    ENDPOINTS,
};