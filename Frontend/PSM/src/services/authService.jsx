const API_URL = 'http://127.0.0.1:8000/api/';

async function register(username, nombre, primerApellido, segundoApellido, email, password, telefono, edad, fecha_nacimiento, nacionalidad) {
    const userData = {
        username,
        email,
        password,
        first_name: nombre,
        // normalizacion en apellidos
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido,
        telefono,
        edad,
        fecha_nacimiento,
        nacionalidad // nuevo campo necesario para la validaciones futuras o nuevos features
    };

    const response = await fetch(`${API_URL}register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!response.ok) {
        // Si hay errores de validación, mostrarlos
        console.error('Errores de validación:', data);
        const errorMsg = typeof data === 'object' ? JSON.stringify(data) : data;
        throw new Error(errorMsg);
    }
    
    return data;
}

async function login(username, password) {
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

    if (!response.ok) {
        throw new Error('Error al iniciar sesión');
    }

    return await response.json();
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
    const token = getToken();
    if (!token) {
        return null;
    }

    // Decodificar el token JWT para obtener el user_id
    const { jwtDecode } = await import('jwt-decode');
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
}

async function updateProfile(userId, userData) {
    const token = getToken();
    const response = await fetch(`${API_URL}User/${userId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
}

export default { register, login, logout, getToken, isAuthenticated, getCurrentUser, updateProfile }