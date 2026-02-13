import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/`;

async function getEventos(noCache = false) {
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

    if (!response.ok) {
        throw new Error('Error obteniendo eventos');
    }

    return await response.json();
}

async function getEventoById(id) {
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

    if (!response.ok) {
        throw new Error('Error al obtener evento por ID');
    }

    return await response.json();
}

async function createEvento(eventoData) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

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
}

async function updateEvento(id, eventoData) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

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

    if (!response.ok) {
        throw new Error('Error al actualizar evento');
    }

    return await response.json();
}

async function deleteEvento(id) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}Evento/${id}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al borrar evento');
    }

    return await response.json();
}

function getEventoImagenUrl(imagenId) {
    if (!imagenId) return null;
    return `${API_URL}Evento/imagen/${imagenId}/`;
}

export default { getEventos, getEventoById, createEvento, updateEvento, deleteEvento, getEventoImagenUrl }
