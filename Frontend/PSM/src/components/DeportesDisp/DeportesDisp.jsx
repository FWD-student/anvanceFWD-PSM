import React, { useState, useEffect } from 'react';
import eventoService from '../../services/eventoService';
import './deportesDisp.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DeportesDisp() {
    const [deportes, setDeportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeportes = async () => {
            try {
                // Obtener todos los eventos
                const eventos = await eventoService.getEventos();

                // Extraer categorías únicas
                const categoriesMap = new Map();
                eventos.forEach(evento => {
                    if (evento.categoria && !categoriesMap.has(evento.categoria.id)) {
                        categoriesMap.set(evento.categoria.id, {
                            id: evento.categoria.id,
                            nombre: evento.categoria.nombre,
                            descripcion: evento.categoria.descripcion
                        });
                    }
                });

                // Convertir Map a array
                const categoriasUnicas = Array.from(categoriesMap.values());
                setDeportes(categoriasUnicas);
            } catch (error) {
                console.error("Error cargando deportes disponibles:", error);
                setError("No se pudieron cargar los deportes disponibles");
            } finally {
                setLoading(false);
            }
        };

        fetchDeportes();
    }, []);

    if (loading) {
        return (
            <section className="deportes-section">
                <div className="deportes-container">
                    <p>Cargando deportes disponibles...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="deportes-section">
                <div className="deportes-container">
                    <p className="error-message">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="deportes-section">
            <div className="deportes-container">
                <h2 className="deportes-title">Deportes Disponibles</h2>

                {deportes.length > 0 ? (
                    <div className="deportes-grid">
                        {deportes.map((deporte) => (
                            <Card key={deporte.id} className="deporte-card">
                                <CardHeader>
                                    <CardTitle className="deporte-nombre">{deporte.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="deporte-descripcion">
                                        {deporte.descripcion || 'Categoría deportiva disponible'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>No hay deportes disponibles en este momento.</p>
                )}
            </div>
        </section>
    );
}

export default DeportesDisp;