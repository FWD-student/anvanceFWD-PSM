const API_URL = 'http://127.0.0.1:8000/api/';

async function getResenas(noCache = false) {
    try {
        let url = `${API_URL}Resena/`;
        if (noCache) {
            url += `?t=${new Date().getTime()}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo reseñas:', error);
        throw error;
    }
}

async function getResenaById(id) {
    try {
        const response = await fetch(`${API_URL}Resena/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo reseña por id:', error);
        throw error;
    }
}

async function createResena(usuario, evento, calificacion, comentario) {
    try {
        const token = localStorage.getItem('access_token');

        const resenaData = {
            usuario,
            evento,
            calificacion,
            comentario
        };

        const response = await fetch(`${API_URL}Resena/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(resenaData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error creando reseña:', error);
        throw error;
    }
}

async function updateResena(id, usuario, evento, calificacion, comentario) {
    try {
        const token = localStorage.getItem('access_token');

        const resenaData = {
            usuario,
            evento,
            calificacion,
            comentario
        };

        const response = await fetch(`${API_URL}Resena/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(resenaData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error actualizando reseña:', error);
        throw error;
    }
}

async function deleteResena(id) {
    try {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${API_URL}Resena/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error eliminando reseña:', error);
        throw error;
    }
}

export default { getResenas, getResenaById, createResena, updateResena, deleteResena }