import React, { useState, useEffect } from 'react';
import categoriaService from '../../services/categoriaService';
import './categoriasPopulares.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function CategoriasPopulares() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoriasPopulares = async () => {
            try {
                const data = await categoriaService.getCategoriasPopulares();
                setCategorias(data);
                setLoading(false);
            } catch (err) {
                console.error("Error cargando categorías populares:", err);
                setError("No se pudieron cargar las categorías populares");
                setLoading(false);
            }
        };

        fetchCategoriasPopulares();
    }, []);

    if (loading) {
        return (
            <section className="categorias-populares-section">
                <div className="categorias-populares-container">
                    <p className="loading-message">Cargando categorías populares...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="categorias-populares-section">
                <div className="categorias-populares-container">
                    <p className="error-message">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="categorias-populares-section">
            <div className="categorias-populares-container">
                <h2 className="categorias-populares-title">Deportes Más Populares</h2>

                {categorias.length > 0 ? (
                    <div className="categorias-populares-grid">
                        {categorias.map((categoria) => (
                            <Card key={categoria.id} className="categoria-popular-card">
                                <CardHeader>
                                    <CardTitle className="categoria-popular-nombre">
                                        {categoria.nombre}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="categoria-popular-descripcion">
                                        {categoria.descripcion || 'Categoría deportiva popular'}
                                    </p>
                                    <Badge variant="secondary" className="categoria-popular-badge">
                                        {categoria.cantidad_eventos} {categoria.cantidad_eventos === 1 ? 'evento' : 'eventos'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>No hay categorías populares en este momento.</p>
                )}
            </div>
        </section>
    );
}

export default CategoriasPopulares;
