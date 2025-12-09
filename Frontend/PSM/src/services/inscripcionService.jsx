const API_URL = 'http://127.0.0.1:8000/api/Inscripcion/';

const getInscripciones = async (noCache = false) => {
    const token = localStorage.getItem('token');
    let url = API_URL;

    if (noCache) {
        url += `?t=${new Date().getTime()}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
};

const getInscripcionById = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${id}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
};

const createInscripcion = async (inscripcionData, token) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inscripcionData)
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
};

const updateInscripcion = async (id, inscripcionData, token) => {
    const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(inscripcionData)
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
};

const deleteInscripcion = async (id, token) => {
    const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    // DELETE puede no devolver contenido
    if (response.status === 204) {
        return { success: true };
    }
    return await response.json();
};

// Obtener inscripciones del usuario actual
const getMisInscripciones = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}mis-inscripciones/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
};

const inscripcionService = {
    getInscripciones,
    getInscripcionById,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion,
    getMisInscripciones
};

export default inscripcionService;