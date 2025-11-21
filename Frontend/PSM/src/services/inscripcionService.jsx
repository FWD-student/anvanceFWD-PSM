import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/Inscripcion/';

const getInscripciones = async (noCache = false) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {}
    };

    if (noCache) {
        config.params.t = new Date().getTime();
    }

    const response = await axios.get(API_URL, config);
    return response.data;
};

const getInscripcionById = async (id) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const response = await axios.get(`${API_URL}${id}/`, config);
    return response.data;
};

const createInscripcion = async (inscripcionData, token) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    const response = await axios.post(API_URL, inscripcionData, config);
    return response.data;
};

const updateInscripcion = async (id, inscripcionData, token) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    const response = await axios.put(`${API_URL}${id}/`, inscripcionData, config);
    return response.data;
};

const deleteInscripcion = async (id, token) => {
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    const response = await axios.delete(`${API_URL}${id}/`, config);
    return response.data;
};

const inscripcionService = {
    getInscripciones,
    getInscripcionById,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion
};

export default inscripcionService;