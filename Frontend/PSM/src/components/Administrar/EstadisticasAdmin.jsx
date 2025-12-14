import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Calendar, CheckCircle, Star, Mail, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import estadisticasService from '../../services/estadisticasService';

// Colores para gráficos que combinan con el tema
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Componente de tarjeta KPI animada
const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', delay = 0 }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.4, ease: 'easeOut' }}
        >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10`} />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <h3 className="text-3xl font-bold mt-1">{value}</h3>
                            {subtitle && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                                    {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white`}>
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

function EstadisticasAdmin() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchEstadisticas();
    }, []);

    const fetchEstadisticas = async () => {
        try {
            const data = await estadisticasService.getEstadisticas();
            setStats(data);
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron cargar las estadísticas'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Activity className="h-16 w-16 mb-4 opacity-50" />
                <p>No se pudieron cargar las estadísticas</p>
            </div>
        );
    }

    // Datos para el gráfico de eventos por estado
    const eventosEstadoData = [
        { name: 'Activos', value: stats.eventos.activos, fill: '#10b981' },
        { name: 'Inactivos', value: stats.eventos.inactivos, fill: '#f59e0b' },
        { name: 'Finalizados', value: stats.eventos.finalizados, fill: '#6b7280' }
    ];

    // Datos para el gráfico de inscripciones por estado
    const inscripcionesEstadoData = [
        { name: 'Confirmadas', value: stats.inscripciones.confirmadas, fill: '#10b981' },
        { name: 'Pendientes', value: stats.inscripciones.pendientes, fill: '#f59e0b' },
        { name: 'Canceladas', value: stats.inscripciones.canceladas, fill: '#ef4444' }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
                <p className="text-muted-foreground">Panel de métricas para la toma de decisiones</p>
            </motion.div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Usuarios"
                    value={stats.usuarios.total}
                    subtitle={`+${stats.usuarios.nuevos_7d} últimos 7 días`}
                    icon={Users}
                    color="blue"
                    trend="up"
                    delay={0}
                />
                <KPICard
                    title="Eventos Activos"
                    value={stats.eventos.activos}
                    subtitle={`${stats.eventos.total} total`}
                    icon={Calendar}
                    color="green"
                    delay={1}
                />
                <KPICard
                    title="Inscripciones"
                    value={stats.inscripciones.total}
                    subtitle={`${stats.inscripciones.tasa_asistencia}% asistencia`}
                    icon={CheckCircle}
                    color="amber"
                    delay={2}
                />
                <KPICard
                    title="Calificación Promedio"
                    value={`${stats.resenas.promedio_calificacion}★`}
                    subtitle={`${stats.resenas.total} reseñas`}
                    icon={Star}
                    color="purple"
                    delay={3}
                />
            </div>

            {/* Segunda fila de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    title="Usuarios Activos"
                    value={stats.usuarios.activos}
                    subtitle="Últimos 30 días"
                    icon={Activity}
                    color="green"
                    delay={4}
                />
                <KPICard
                    title="Usuarios Inactivos"
                    value={stats.usuarios.inactivos}
                    subtitle="Sin conexión >30 días"
                    icon={Users}
                    color="red"
                    delay={5}
                />
                <KPICard
                    title="Mensajes Contacto"
                    value={stats.contactos.ultimos_7d}
                    subtitle="Últimos 7 días"
                    icon={Mail}
                    color="blue"
                    delay={6}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de inscripciones por mes */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Inscripciones por Mes</CardTitle>
                            <CardDescription>Tendencia de los últimos 6 meses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.inscripciones.por_mes}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="mes" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="cantidad"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#3b82f6' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Gráfico de inscripciones por estado */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Estado de Inscripciones</CardTitle>
                            <CardDescription>Distribución actual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={inscripcionesEstadoData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        labelLine={false}
                                    >
                                        {inscripcionesEstadoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                                    <Legend 
                                        formatter={(value, entry) => {
                                            const item = inscripcionesEstadoData.find(d => d.name === value);
                                            const total = inscripcionesEstadoData.reduce((acc, d) => acc + d.value, 0);
                                            const percent = total > 0 ? ((item?.value || 0) / total * 100).toFixed(0) : 0;
                                            return `${value} (${percent}%)`;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Eventos populares y categorías demandadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eventos más populares */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Eventos Más Populares</CardTitle>
                            <CardDescription>Top 5 por inscripciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.eventos.populares} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis type="number" className="text-xs" />
                                    <YAxis 
                                        dataKey="nombre" 
                                        type="category" 
                                        width={120}
                                        className="text-xs"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="total_inscripciones" 
                                        fill="#3b82f6" 
                                        radius={[0, 4, 4, 0]}
                                        name="Inscripciones"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Categorías más demandadas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Categorías Más Demandadas</CardTitle>
                            <CardDescription>Top 5 por inscripciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.inscripciones.categorias_demandadas}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="nombre" 
                                        className="text-xs" 
                                        tick={{ fontSize: 10 }}
                                        angle={-20}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="total_inscripciones" 
                                        fill="#10b981" 
                                        radius={[4, 4, 0, 0]}
                                        name="Inscripciones"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Eventos mejor calificados */}
            {stats.resenas.mejor_calificados.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500" />
                                Eventos Mejor Calificados
                            </CardTitle>
                            <CardDescription>Basado en reseñas de usuarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.resenas.mejor_calificados.map((evento, index) => (
                                    <div key={evento.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                                            <span className="font-medium">{evento.nombre}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500 font-bold">{evento.promedio?.toFixed(1) || 0}★</span>
                                            <span className="text-xs text-muted-foreground">({evento.total_resenas} reseñas)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

export default EstadisticasAdmin;