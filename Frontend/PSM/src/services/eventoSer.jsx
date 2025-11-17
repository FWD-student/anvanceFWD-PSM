async function getCitas() {
    try {
        const peticion = await fetch('http://localhost:8000/api/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!peticion.ok) {
            throw new Error("Error al obtener las citas");
        }

        const consultas = await peticion.json();
        return consultas;

    } catch (error) {
        console.error("Hay problemas para obtener", error);
        throw error;
    }
}

async function createCitas(nuevaConsulta) {
    try {
        const peticion = await fetch('http://localhost:3001/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaConsulta)
        });

        if (!peticion.ok) {
            throw new Error("Error al crear la cita");
        }

        const consultaCreada = await peticion.json();
        return consultaCreada;

    } catch (error) {
        console.error("Error al crear", error);
        throw error;
    }
}

async function updateCitas(id, datosActualizados) {
    try {
        const peticion = await fetch(`http://localhost:3001/citas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (!peticion.ok) {
            throw new Error("Error al actualizar la citas");
        }

        const consultaActualizada = await peticion.json();
        return consultaActualizada;

    } catch (error) {
        console.error("Problema existente", error);
        throw error;
    }
}

async function deleteCitas(id) {
    try {
        const peticion = await fetch(`http://localhost:3001/citas/${id}`, {
            method: 'DELETE'
        });

        if (!peticion.ok) {
            throw new Error("Error al eliminar la cita");
        }

        return { mensaje: "Cita eliminada correctamente" };

    } catch (error) {
        console.error("Problema existente", error);
        throw error;
    }
}

export default { getCitas, createCitas, updateCitas, deleteCitas};