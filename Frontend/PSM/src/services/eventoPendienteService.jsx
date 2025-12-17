const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Obtener eventos pendientes
async function getPendientes() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/n8n/eventos-pendientes/`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

// Aprobar evento pendiente
async function aprobarEvento(eventoToken, datosEditados = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/n8n/aprobar-evento/${eventoToken}/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEditados)
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

// Rechazar evento pendiente
async function rechazarEvento(eventoToken) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/n8n/rechazar-evento/${eventoToken}/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

export default { getPendientes, aprobarEvento, rechazarEvento };