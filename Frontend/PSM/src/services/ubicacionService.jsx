const API_URL = 'http://127.0.0.1:8000/api/';

async function getUbicaciones() {
    try {
        const response = await fetch(`${API_URL}Ubicacion/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener ubicacion por ID:', error);
        throw error;
    }
}

async function createUbicacion(recinto, direccion, telefono_contacto) {
    try {
        const token = localStorage.getItem('access_token');
        
        const ubicacionData = {
            recinto,
            direccion,
            telefono_contacto
        };

        const response = await fetch(`${API_URL}Ubicacion/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ubicacionData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error creando ubicacion:', error);
        throw error;
    }
}

async function updateUbicacion(id, recinto, direccion, telefono_contacto) {
    try {
        const token = localStorage.getItem('access_token');

        const ubicacionData = {
            recinto,
            direccion,
            telefono_contacto
        };

        const response = await fetch(`${API_URL}Ubicacion/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ubicacionData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error actualizando ubicacion:', error);
        throw error;
    }
}

async function deleteUbicacion(id) {
    try {
        const token = localStorage.getItem('access_token');

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