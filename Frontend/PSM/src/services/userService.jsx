import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/`;

async function getUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}User/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo users:', error);
        throw error;
    }
}

async function getUserById(id) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}User/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error al obtener user por ID:', error);
        throw error;
    }
}

async function updateUser(id, userData) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}User/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error actualizando user:', error);
        throw error;
    }
}

async function deleteUser(id) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}User/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error borrando user:', error);
        throw error;
    }
}

export default { getUsers, getUserById, updateUser, deleteUser }
