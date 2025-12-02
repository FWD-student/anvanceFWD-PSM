const API_URL = 'http://127.0.0.1:8000/api/';

async function getEventos(noCache = false) {
    try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}Evento/`;
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
        console.error('Error obteniendo eventos:', error);
        throw error;
    }
}

async function getEventoById(id) {
    try {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}Evento/${id}/`, {
            method: 'GET',
            headers: headers
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener evento por ID:', error);
        throw error;
    }
}

async function createEvento(eventoData) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Si no es FormData, uno asume que es JSON y agregamos Content-Type
        let body = eventoData;
        if (!(eventoData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(eventoData);
        }

        const response = await fetch(`${API_URL}Evento/`, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error al crear evento:', error);
        throw error;
    }
}

async function updateEvento(id, eventoData) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Si no es FormData, asumimos que es JSON y agregamos Content-Type
        let body = eventoData;
        if (!(eventoData instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(eventoData);
        }

        const response = await fetch(`${API_URL}Evento/${id}/`, {
            method: 'PUT',
            headers: headers,
            body: body
        });

        return await response.json();

    } catch (error) {
        console.error('Error al actualizar evento:', error);
        throw error;
    }
}

async function deleteEvento(id) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}Evento/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error al borrar evento:', error);
        throw error;
    }
}

function getEventoImagenUrl(imagenId) {
    if (!imagenId) return null;
    return `${API_URL}Evento/imagen/${imagenId}/`;
}

export default { getEventos, getEventoById, createEvento, updateEvento, deleteEvento, getEventoImagenUrl };