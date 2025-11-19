const API_URL = 'http://127.0.0.1:8000/api/';

async function getInscripciones() {
    try {
        const response = await fetch(`${API_URL}Inscripcion/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo inscripciones:', error);
        throw error;
    }
}

async function getInscripcionById(id) {
    try {
        const response = await fetch(`${API_URL}Inscripcion/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo inscripcion por id:', error);
        throw error;
    }
}

async function createInscripcion(usuario, evento, estado, comentarios) {
    try {
        const token = localStorage.getItem('access_token');
        
        const inscripcionData = {
            usuario,
            evento,
            estado,
            comentarios
        };

        const response = await fetch(`${API_URL}Inscripcion/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(inscripcionData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error creando inscripcion:', error);
        throw error;
    }
}

async function updateInscripcion(id, usuario, evento, estado, comentarios) {
    try {
        const token = localStorage.getItem('access_token');

        const inscripcionData = {
            usuario,
            evento,
            estado,
            comentarios
        };

        const response = await fetch(`${API_URL}Inscripcion/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(inscripcionData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error actualizando inscripcion:', error);
        throw error;
    }
}

async function deleteInscripcion(id) {
    try {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${API_URL}Inscripcion/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error eliminando inscripcion:', error);
        throw error;
    }
}

export default { getInscripciones, getInscripcionById, createInscripcion, updateInscripcion, deleteInscripcion }