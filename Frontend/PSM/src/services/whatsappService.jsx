import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/whatsapp/generar-codigo/`;

// Obtener codigo activo del admin
async function obtenerCodigo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error obteniendo codigo WhatsApp:', error);
        throw error;
    }
}

// Generar nuevo codigo de autorizacion
async function generarCodigo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error generando codigo WhatsApp:', error);
        throw error;
    }
}

export default { obtenerCodigo, generarCodigo };