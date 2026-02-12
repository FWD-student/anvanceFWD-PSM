import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, MapPin, Users, MessageSquare, RefreshCw, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import EventoService from '../../services/eventoService';
import UbicacionService from '../../services/ubicacionService';
import InscripcionService from '../../services/inscripcionService';
import ResenaService from '../../services/resenaService';

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
            gradient: 'from-blue-500 to-cyan-500',
            bgGlow: 'shadow-blue-500/20'
        },
        {
            title: 'Ubicaciones',
            value: stats.totalUbicaciones,
            subtitle: 'Recintos registrados',
            icon: MapPin,
            gradient: 'from-emerald-500 to-teal-500',
            bgGlow: 'shadow-emerald-500/20'
        },
        {
            title: 'Inscripciones',
            value: stats.totalInscripciones,
            subtitle: `${stats.inscripcionesPendientes} pendientes`,
            icon: Users,
            gradient: 'from-violet-500 to-purple-500',
            bgGlow: 'shadow-violet-500/20'
        },
        {
            title: 'Reseñas',
            value: stats.totalResenas,
            subtitle: 'Comentarios recibidos',
            icon: MessageSquare,
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'shadow-amber-500/20'
        }
    ];

    const quickActions = [
        {
            title: 'Crear Evento',
            description: 'Agregar nuevo evento deportivo',
            path: '/admin/eventos',
            icon: Calendar,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Nueva Ubicación',
            description: 'Registrar nuevo recinto',
            path: '/admin/ubicaciones',
            icon: MapPin,
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            title: 'Ver Inscripciones',
            description: 'Gestionar participantes',
            path: '/admin/inscripciones',
            icon: Users,
            gradient: 'from-violet-500 to-purple-500'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto"
                        style={{ borderWidth: '3px' }}
                    />
                    <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-foreground tracking-tight"
                    >
                        Dashboard
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        Resumen general del sistema
                    </motion.p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cargarEstadisticas}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 font-medium"
                >
                    <RefreshCw size={18} />
                    Actualizar
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                            <Card className={`relative overflow-hidden border-0 bg-card hover:shadow-xl ${stat.bgGlow} transition-all duration-300 group`}>
                                {/* Gradient accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                                
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                        <Icon className="text-white" size={18} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <motion.div 
                                        className="text-4xl font-bold text-foreground tracking-tight"
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                                    >
                                        {stat.value}
                                    </motion.div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border-0 bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(action.path)}
                                        className="group relative overflow-hidden p-5 border border-border rounded-2xl hover:border-transparent hover:shadow-xl transition-all duration-300 text-left bg-gradient-to-br from-background to-muted/30"
                                    >
                                        {/* Hover gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                                        
                                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-3 shadow-lg`}>
                                            <Icon className="text-white" size={22} />
                                        </div>
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            {action.title}
                                            <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default Dashboard;