// config.js - URLs de la API
const getApiUrl = () => {
    // En producción (Vercel), usa tu backend de Railway
    if (import.meta.env.PROD) {
        // HARDCODED PARA ASEGURAR QUE FUNCIONE
        return 'https://anvancefwd-psm-production.up.railway.app/api';
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
        register: `${API_BASE_URL}/register/`,
    },
    users: `${API_BASE_URL}/User/`,
    eventos: `${API_BASE_URL}/Evento/`,
    inscripciones: `${API_BASE_URL}/Inscripcion/`,
    categorias: `${API_BASE_URL}/CategEvento/`,
    resenas: `${API_BASE_URL}/Resena/`,
    estadisticas: `${API_BASE_URL}/estadisticas/`,
    configuracion: `${API_BASE_URL}/configuracion/perfil/`,
    contacto: `${API_BASE_URL}/Contacto/`,
    ubicaciones: `${API_BASE_URL}/Ubicacion/`,
};

export default {
    API_BASE_URL,
    ENDPOINTS,
};