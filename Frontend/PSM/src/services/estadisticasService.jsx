import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/`;

async function getEstadisticas() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}estadisticas/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
    }

    return await response.json();
}

export default { getEstadisticas }