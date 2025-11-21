const API_URL = 'http://127.0.0.1:8000/api/';

async function getUbicaciones(noCache = false) {
    try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}Ubicacion/`;
        if (noCache) {
            url += `?t=${new Date().getTime()}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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
        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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

        return await response.json();

    } catch (error) {
        console.error('Error borramdo ubicacion:', error);
        throw error;
    }
}

export default { getUbicaciones, getUbicacionById, createUbicacion, updateUbicacion, deleteUbicacion }