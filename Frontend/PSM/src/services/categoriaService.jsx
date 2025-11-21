const API_URL = 'http://127.0.0.1:8000/api/';

async function getCategEventos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}CategEvento/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo categorias:', error);
        throw error;
    }
}

async function getCategEventoById(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}CategEvento/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener por ID categoria:', error);
        throw error;
    }
}

async function createCategEvento(nombre, descripcion, estado) {
    try {
        const token = localStorage.getItem('token');

        const categData = {
            nombre,
            descripcion,
            estado
        };

        const response = await fetch(`${API_URL}CategEvento/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error creando categoria:', error);
        throw error;
    }
}

async function updateCategEvento(id, nombre, descripcion, estado) {
    try {
        const token = localStorage.getItem('token');

        const categData = {
            nombre,
            descripcion,
            estado
        };

        const response = await fetch(`${API_URL}CategEvento/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error al actualizar categoria:', error);
        throw error;
    }
}

async function deleteCategEvento(id) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}CategEvento/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error borrando categoria:', error);
        throw error;
    }
}

export default { getCategEventos, getCategEventoById, createCategEvento, updateCategEvento, deleteCategEvento }