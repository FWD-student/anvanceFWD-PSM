import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Star, Trash2, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ResenaService from '../../services/resenaService';
import EventoService from '../../services/eventoService';

function ResenasAdmin() {
    const [resenas, setResenas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [resenaAEliminar, setResenaAEliminar] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

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

    const abrirConfirmacionEliminar = (resena) => {
        setResenaAEliminar(resena);
        setConfirmDeleteOpen(true);
    };

    const eliminarResena = async () => {
        if (!resenaAEliminar) return;

        const token = localStorage.getItem('token');
        try {
            await ResenaService.deleteResena(resenaAEliminar.id, token);
            setResenas(prev => prev.filter(r => r.id !== resenaAEliminar.id));
            toast({
                title: "Reseña eliminada",
                description: "La reseña se eliminó correctamente.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al eliminar la reseña. Intenta nuevamente.",
            });
        } finally {
            setConfirmDeleteOpen(false);
            setResenaAEliminar(null);
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Reseñas</h1>
                <p className="text-muted-foreground mt-1">Modera las reseñas de los eventos</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="mb-4 text-sm text-muted-foreground">
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
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                                                    <span className="text-sm text-muted-foreground">
                                                        ({resena.calificacion}/5)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <p className="text-sm text-foreground/80 line-clamp-2">
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
                                                    onClick={() => abrirConfirmacionEliminar(resena)}
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

            {/* Dialog de confirmación para eliminar */}
            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={eliminarResena}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ResenasAdmin;