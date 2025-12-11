import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, MapPin, Users, MessageSquare, RefreshCw } from 'lucide-react';
import EventoService from '../../services/EventoService';
import UbicacionService from '../../services/UbicacionService';
import InscripcionService from '../../services/InscripcionService';
import ResenaService from '../../services/ResenaService';

function Dashboard() {
    const [stats, setStats] = useState({
        totalEventos: 0,
        eventosActivos: 0,
        totalUbicaciones: 0,
        totalInscripciones: 0,
        inscripcionesPendientes: 0,
        totalResenas: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setLoading(true);
        try {
            // cache busting concepto nuevo
            const [eventos, ubicaciones, inscripciones, resenas] = await Promise.all([
                EventoService.getEventos(true),
                UbicacionService.getUbicaciones(true),
                InscripcionService.getInscripciones(true),
                ResenaService.getResenas(true)
            ]);

            setStats({
                totalEventos: eventos.length,
                eventosActivos: eventos.filter(e => e.estado === 'activo').length,
                totalUbicaciones: ubicaciones.length,
                totalInscripciones: inscripciones.length,
                inscripcionesPendientes: inscripciones.filter(i => i.estado === 'pendiente').length,
                totalResenas: resenas.length
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            title: 'Total Eventos',
            value: stats.totalEventos,
            subtitle: `${stats.eventosActivos} activos`,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Ubicaciones',
            value: stats.totalUbicaciones,
            subtitle: 'Recintos registrados',
            icon: MapPin,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: 'Inscripciones',
            value: stats.totalInscripciones,
            subtitle: `${stats.inscripcionesPendientes} pendientes`,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            title: 'Reseñas',
            value: stats.totalResenas,
            subtitle: 'Comentarios recibidos',
            icon: MessageSquare,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando estadisticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Resumen general del sistema</p>
                </div>
                <button
                    onClick={cargarEstadisticas}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <RefreshCw size={18} />
                    Recargar Datos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow bg-card text-card-foreground">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={stat.color} size={20} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/admin/eventos')}
                            className="p-4 border-2 border-dashed border-border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                        >
                            <Calendar className="text-blue-600 mb-2" size={24} />
                            <h3 className="font-semibold text-foreground">Crear Evento</h3>
                            <p className="text-sm text-muted-foreground">Agregar nuevo evento deportivo</p>
                        </button>

                        <button
                            onClick={() => navigate('/admin/ubicaciones')}
                            className="p-4 border-2 border-dashed border-border rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left"
                        >
                            <MapPin className="text-green-600 mb-2" size={24} />
                            <h3 className="font-semibold text-foreground">Nueva Ubicación</h3>
                            <p className="text-sm text-muted-foreground">Registrar nuevo recinto</p>
                        </button>

                        <button
                            onClick={() => navigate('/admin/inscripciones')}
                            className="p-4 border-2 border-dashed border-border rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                        >
                            <Users className="text-purple-600 mb-2" size={24} />
                            <h3 className="font-semibold text-foreground">Ver Inscripciones</h3>
                            <p className="text-sm text-muted-foreground">Gestionar participantes</p>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;