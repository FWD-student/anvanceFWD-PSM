const API_URL = 'http://127.0.0.1:8000/api/';

async function getCategEventos() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}CategEvento/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error obteniendo categorias');
    }

    return await response.json();
}

async function getCategEventoById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}CategEvento/${id}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener por ID categoria');
    }

    return await response.json();
}

async function createCategEvento(nombre, descripcion, estado) {
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

    if (!response.ok) {
        throw new Error('Error creando categoria');
    }

    return await response.json();
}

async function updateCategEvento(id, nombre, descripcion, estado) {
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

    if (!response.ok) {
        throw new Error('Error al actualizar categoria');
    }

    return await response.json();
}

async function deleteCategEvento(id) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}CategEvento/${id}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error borrando categoria');
    }

    return await response.json();
}

// Obtener las categorias mas populares (con mas eventos)
async function getCategoriasPopulares() {
    const response = await fetch(`${API_URL}CategEvento/populares/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Error obteniendo categorias populares');
    }

    return await response.json();
}

export default { getCategEventos, getCategEventoById, createCategEvento, updateCategEvento, deleteCategEvento, getCategoriasPopulares }