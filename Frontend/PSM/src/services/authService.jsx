const API_URL = 'http://127.0.0.1:8000/api/';

async function register(username, nombre, apellido, email, password, telefono, edad, fecha_nacimiento) {
    try {
        const userData = {
            username,
            email,
            password,
            first_name: nombre, //first_name: username,
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

// Cerrar la sesion y limpiar localStorage
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
}

// Obtener el token del localStorage
function getToken() {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
}

// Verificar si hay usuario autenticado
function isAuthenticated() {
    return !!getToken();
}

// Obtener la informacion del usuario actual desde el token
async function getCurrentUser() {
    try {
        const token = getToken();
        if (!token) {
            return null;
        }

        // Decodificar el token JWT para obtener el user_id
        const jwtDecode = (await import('jwt-decode')).default;
        const decoded = jwtDecode(token);
        const userId = decoded.user_id;

        // Obtener la informacion completa del usuario desde el backend
        const response = await fetch(`${API_URL}User/${userId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        return await response.json();

    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
}

export default { register, login, logout, getToken, isAuthenticated, getCurrentUser }