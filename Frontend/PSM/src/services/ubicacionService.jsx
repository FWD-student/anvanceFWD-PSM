import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/`;

async function getUbicaciones(noCache = false) {
    try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}Ubicacion/`;
        if (noCache) {
            url += `?t=${new Date().getTime()}`;
        }
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        throw error;
    }
}

async function getUbicacionById(id) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'GET',
            headers: headers
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener ubicacion por ID:', error);
        throw error;
    }
}

async function createUbicacion(ubicacionData) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}Ubicacion/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ubicacionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            throw new Error(JSON.stringify(errorData));
        }

        return await response.json();

    } catch (error) {
        console.error('Error creando ubicacion:', error);
        throw error;
    }
}

async function updateUbicacion(id, ubicacionData) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ubicacionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            throw new Error(JSON.stringify(errorData));
        }

        return await response.json();

    } catch (error) {
        console.error('Error actualizando ubicacion:', error);
        throw error;
    }
}

async function deleteUbicacion(id) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al borrar ubicacion');
        }

        return await response.json();

    } catch (error) {
        console.error('Error borrando ubicacion:', error);
        throw error;
    }
}

export default { getUbicaciones, getUbicacionById, createUbicacion, updateUbicacion, deleteUbicacion }