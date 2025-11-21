const API_URL = 'http://127.0.0.1:8000/api/';

async function getEventos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}Evento/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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
        const response = await fetch(`${API_URL}Evento/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener evento por ID:', error);
        throw error;
    }
}

async function createEvento(nombre, descripcion, categoria, ubicacion, fecha_inicio, fecha_fin, horario, cupo_maximo, cupos_disponibles, edad_minima, edad_maxima, requisitos, estado) {
    try {
        const token = localStorage.getItem('token');

        const eventoData = {
            nombre,
            descripcion,
            categoria,
            ubicacion,
            fecha_inicio,
            fecha_fin,
            horario,
            cupo_maximo,
            cupos_disponibles,
            edad_minima,
            edad_maxima,
            requisitos,
            estado
        };

        const response = await fetch(`${API_URL}Evento/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventoData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error al crear evento:', error);
        throw error;
    }
}

async function updateEvento(id, eventoData) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}Evento/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventoData)
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

export default { getEventos, getEventoById, createEvento, updateEvento, deleteEvento }