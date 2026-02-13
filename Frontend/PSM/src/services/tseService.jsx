import { API_BASE_URL } from '../config';

/*
  Valida una cédula costarricense contra el TSE
  @param {string} cedula - Número de cédula (con o sin guiones)
  @returns {Promise<Object>} - Datos de la persona o error
*/
async function validarCedula(cedula) {
    try {
        const response = await fetch(`${API_BASE_URL}/validar-cedula/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cedula })
        });
        
        const data = await response.json();
        
        if (response.ok && data.valida) {
            return {
                success: true,
                data: {
                    nombre: data.nombre || '',
                    primerApellido: data.primer_apellido || '',
                    segundoApellido: data.segundo_apellido || '',
                    nombreCompleto: data.nombre_completo || '',
                    fechaNacimiento: data.fecha_nacimiento || null, // formato YYYY-MM-DD
                    nacionalidad: data.nacionalidad || '',
                    edad: data.edad || null
                }
            };
        } else {
            return {
                success: false,
                error: data.error || 'Cédula no encontrada o inválida'
            };
        }
    } catch (error) {
        console.error('Error validando cédula:', error);
        return {
            success: false,
            error: 'Error de conexión. Intente de nuevo.'
        };
    }
}

const tseService = {
    validarCedula
};

export default tseService;