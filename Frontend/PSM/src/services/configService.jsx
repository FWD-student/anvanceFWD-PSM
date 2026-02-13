import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/configuracion/perfil/`;

async function getConfig() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        throw error;
    }
}

async function updateConfig(config) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        throw error;
    }
}

export default { getConfig, updateConfig };