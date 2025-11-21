const API_URL = 'http://127.0.0.1:8000/api/';

async function register(username, apellido, email, password, telefono, edad, fecha_nacimiento) {
    try {
        const userData = {
            username,
            email,
            password,
            first_name: username,
            last_name: apellido,
            telefono,
            edad,
            fecha_nacimiento
        };

        const response = await fetch(`${API_URL}register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return await response.json();

    } catch (error) {
        console.error('Error al registrar user:', error);
        throw error;
    }
}

async function login(username, password) {
    try {
        const credentials = {
            username,
            password
        };

        const response = await fetch(`${API_URL}token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        return await response.json();

    } catch (error) {
        console.error('Error acceder in:', error);
        throw error;
    }
}

export default { register, login }