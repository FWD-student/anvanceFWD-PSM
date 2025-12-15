const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
/*
 * Envía un código de verificación al email proporcionado
 * @param {string} email - Email para verificar
 * @returns {Promise<Object>} - { success, message } o { success: false, error }
 */
async function enviarCodigo(email) {
    try {
        const response = await fetch(`${API_URL}enviar-codigo/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            return {
                success: true,
                message: data.message || 'Código enviado correctamente'
            };
        } else {
            return {
                success: false,
                error: data.error || 'Error al enviar el código'
            };
        }
    } catch (error) {
        console.error('Error enviando código:', error);
        return {
            success: false,
            error: 'Error de conexión. Intente de nuevo.'
        };
    }
}

/*
 * Verifica el código ingresado por el usuario
 * @param {string} email - Email a verificar
 * @param {string} codigo - Código de 6 dígitos
 * @returns {Promise<Object>} - { success, email_verificado } o { success: false, error }
 */
async function verificarCodigo(email, codigo) {
    try {
        const response = await fetch(`${API_URL}verificar-codigo/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, codigo })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            return {
                success: true,
                email_verificado: true,
                message: data.message || 'Email verificado correctamente'
            };
        } else {
            return {
                success: false,
                error: data.error || 'Código inválido'
            };
        }
    } catch (error) {
        console.error('Error verificando código:', error);
        return {
            success: false,
            error: 'Error de conexión. Intente de nuevo.'
        };
    }
}

const verificacionService = {
    enviarCodigo,
    verificarCodigo
};

export default verificacionService;