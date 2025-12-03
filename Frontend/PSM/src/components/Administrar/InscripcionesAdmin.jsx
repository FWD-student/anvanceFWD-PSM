import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Users, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import InscripcionService from '../../services/inscripcionService';
import EventoService from '../../services/eventoService';

function InscripcionesAdmin() {
    const [inscripciones, setInscripciones] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [inscripcionAEliminar, setInscripcionAEliminar] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [inscripcionesData, eventosData] = await Promise.all([
                InscripcionService.getInscripciones(),
                EventoService.getEventos()
            ]);
            setInscripciones(inscripcionesData);
            setEventos(eventosData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        const token = localStorage.getItem('token');
        try {
            await InscripcionService.updateInscripcion(id, { estado: nuevoEstado }, token);
            setInscripciones(prev =>
                prev.map(ins => ins.id === id ? { ...ins, estado: nuevoEstado } : ins)
            );
            toast({
                title: "Estado actualizado",
                description: "El estado de la inscripción se actualizó correctamente.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al actualizar el estado. Intenta nuevamente.",
            });
        }
    };

    const abrirConfirmacionEliminar = (inscripcion) => {
        setInscripcionAEliminar(inscripcion);
        setConfirmDeleteOpen(true);
    };

    const eliminarInscripcion = async () => {
        if (!inscripcionAEliminar) return;

        const token = localStorage.getItem('token');
        try {
            await InscripcionService.deleteInscripcion(inscripcionAEliminar.id, token);
            setInscripciones(prev => prev.filter(ins => ins.id !== inscripcionAEliminar.id));
            toast({
                title: "Inscripción eliminada",
                description: "La inscripción se eliminó correctamente.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            console.error('Error al eliminar inscripción:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al eliminar la inscripción. Intenta nuevamente.",
            });
        } finally {
            setConfirmDeleteOpen(false);
            setInscripcionAEliminar(null);
        }
    };

    const inscripcionesFiltradas = filtroEstado === 'todas'
        ? inscripciones
        : inscripciones.filter(i => i.estado === filtroEstado);

    const getEstadoBadge = (estado) => {
        const variants = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            confirmada: 'bg-green-100 text-green-800',
            cancelada: 'bg-red-100 text-red-800'
        };
        return variants[estado] || variants.pendiente;
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
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Inscripciones</h1>
                <p className="text-gray-600 mt-1">Administra las inscripciones a eventos</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-center mb-6">
                        <Label>Filtrar por estado:</Label>
                        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas</SelectItem>
                                <SelectItem value="pendiente">Pendientes</SelectItem>
                                <SelectItem value="confirmada">Confirmadas</SelectItem>
                                <SelectItem value="cancelada">Canceladas</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">
                            {inscripcionesFiltradas.length} inscripción(es) encontrada(s)
                        </span>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Evento</TableHead>
                                <TableHead>Fecha Inscripción</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comentarios</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inscripcionesFiltradas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No hay inscripciones registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inscripcionesFiltradas.map((inscripcion) => {
                                    const evento = eventos.find(e => e.id === inscripcion.evento);
                                    return (
                                        <TableRow key={inscripcion.id}>
                                            <TableCell className="font-medium">
                                                Usuario #{inscripcion.usuario}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-blue-600" />
                                                    {evento?.nombre || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatearFecha(inscripcion.fecha_inscripcion)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={inscripcion.estado}
                                                    onValueChange={(value) => cambiarEstado(inscripcion.id, value)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue>
                                                            <Badge className={getEstadoBadge(inscripcion.estado)}>
                                                                {inscripcion.estado}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                                        <SelectItem value="confirmada">Confirmada</SelectItem>
                                                        <SelectItem value="cancelada">Cancelada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {inscripcion.comentarios || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => abrirConfirmacionEliminar(inscripcion)}
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
                            ¿Estás seguro de que deseas eliminar esta inscripción? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={eliminarInscripcion}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default InscripcionesAdmin;