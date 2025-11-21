const API_URL = 'http://127.0.0.1:8000/api/';

async function getContactos() {
    try {
        const response = await fetch(`${API_URL}Contacto/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo contactos:', error);
        throw error;
    }
}

async function createContacto(nombre, correo, telefono, mensaje) {
    try {
        const contactoData = {
            nombre,
            correo,
            telefono,
            mensaje
        };

        const response = await fetch(`${API_URL}Contacto/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactoData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error al enviar mensaje de contacto:', error);
        throw error;
    }
}

export default { getContactos, createContacto }