import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Star, Trash2, Calendar } from 'lucide-react';
import ResenaService from '../../services/ResenaService';
import EventoService from '../../services/EventoService';

function ResenasAdmin() {
    const [resenas, setResenas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resenasData, eventosData] = await Promise.all([
                ResenaService.getResenas(),
                EventoService.getEventos()
            ]);
            setResenas(resenasData);
            setEventos(eventosData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarResena = async (id) => {
        if (!confirm('¿Estas seguro de eliminar esta reseña?')) return;

        const token = localStorage.getItem('token');
        try {
            await ResenaService.deleteResena(id, token);
            setResenas(prev => prev.filter(r => r.id !== id));
            alert('Reseña eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            alert('Error al eliminar la reseña');
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderEstrellas = (calificacion) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={star <= calificacion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <AdminLayout activeTab="resenas">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="resenas">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Reseñas</h1>
                    <p className="text-gray-600 mt-1">Modera las reseñas de los eventos</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 text-sm text-gray-600">
                            Total de reseñas: {resenas.length}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>Calificación</TableHead>
                                    <TableHead>Comentario</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resenas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No hay reseñas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    resenas.map((resena) => {
                                        const evento = eventos.find(e => e.id === resena.evento);
                                        return (
                                            <TableRow key={resena.id}>
                                                <TableCell className="font-medium">
                                                    Usuario #{resena.usuario}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-blue-600" />
                                                        {evento?.nombre || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {renderEstrellas(resena.calificacion)}
                                                        <span className="text-sm text-gray-600">
                                                            ({resena.calificacion}/5)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <p className="text-sm text-gray-700 line-clamp-2">
                                                        {resena.comentario || 'Sin comentario'}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatearFecha(resena.fecha_resena)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => eliminarResena(resena.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

export default ResenasAdmin;