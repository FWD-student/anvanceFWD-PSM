import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/`;

async function asignarRole(userId, groupId = 2) {
    try {
        const userData = {
            user: userId,
            group: groupId
        };

        const response = await fetch(`${API_URL}usergroup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error al asignar role:', error);
        throw error;
    }
}

async function getUserGroups() {
    try {
        const response = await fetch(`${API_URL}usergroup/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo user groups:', error);
        throw error;
    }
}

export default { asignarRole, getUserGroups }