import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import eventoService from '../../services/eventoService';
import ubicacionService from '../../services/ubicacionService';
import categoriaService from '../../services/categoriaService';

function EventosAdmin() {
    const [eventos, setEventos] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        ubicacion: '',
        fecha_inicio: '',
        fecha_fin: '',
        horario: '',
        cupo_maximo: '',
        cupos_disponibles: '',
        edad_minima: '',
        edad_maxima: '',
        requisitos: '',
        estado: 'activo'
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [eventosData, ubicacionesData, categoriasData] = await Promise.all([
                eventoService.getEventos(),
                ubicacionService.getUbicaciones(),
                categoriaService.getCategEventos()
            ]);
            setEventos(eventosData);
            setUbicaciones(ubicacionesData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (evento = null) => {
        if (evento) {
            setEditando(evento);
            setFormData({
                nombre: evento.nombre,
                descripcion: evento.descripcion,
                categoria: evento.categoria,
                ubicacion: evento.ubicacion,
                fecha_inicio: evento.fecha_inicio,
                fecha_fin: evento.fecha_fin,
                horario: evento.horario,
                cupo_maximo: evento.cupo_maximo,
                cupos_disponibles: evento.cupos_disponibles,
                edad_minima: evento.edad_minima || '',
                edad_maxima: evento.edad_maxima || '',
                requisitos: evento.requisitos || '',
                estado: evento.estado
            });
        } else {
            setEditando(null);
            setFormData({
                nombre: '',
                descripcion: '',
                categoria: '',
                ubicacion: '',
                fecha_inicio: '',
                fecha_fin: '',
                horario: '',
                cupo_maximo: '',
                cupos_disponibles: '',
                edad_minima: '',
                edad_maxima: '',
                requisitos: '',
                estado: 'activo'
            });
        }
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditando(null);
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const guardarEvento = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.descripcion || !formData.categoria || !formData.ubicacion) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        try {
            if (editando) {
                await eventoService.updateEvento(editando.id, formData);
                alert('Evento actualizado correctamente');
            } else {
                await eventoService.createEvento(
                    formData.nombre,
                    formData.descripcion,
                    formData.categoria,
                    formData.ubicacion,
                    formData.fecha_inicio,
                    formData.fecha_fin,
                    formData.horario,
                    formData.cupo_maximo,
                    formData.cupos_disponibles,
                    formData.edad_minima,
                    formData.edad_maxima,
                    formData.requisitos,
                    formData.estado
                );
                alert('Evento creado correctamente');
            }
            cerrarModal();
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar evento:', error);
            alert('Error al guardar el evento');
        }
    };

    const eliminarEvento = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;

        try {
            await eventoService.deleteEvento(id);
            alert('Evento eliminado correctamente');
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar evento:', error);
            alert('Error al eliminar el evento');
        }
    };

    const eventosFiltrados = filtroEstado === 'todos'
        ? eventos
        : eventos.filter(e => e.estado === filtroEstado);

    const getEstadoBadge = (estado) => {
        const variants = {
            activo: 'bg-green-100 text-green-800',
            inactivo: 'bg-gray-100 text-gray-800',
            finalizado: 'bg-blue-100 text-blue-800'
        };
        return variants[estado] || variants.activo;
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
                    <p className="text-gray-600 mt-1">Administra los eventos deportivos</p>
                </div>
                <Button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={20} className="mr-2" />
                    Nuevo Evento
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-center">
                        <Label>Filtrar por estado:</Label>
                        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="activo">Activos</SelectItem>
                                <SelectItem value="inactivo">Inactivos</SelectItem>
                                <SelectItem value="finalizado">Finalizados</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">
                            {eventosFiltrados.length} evento(s)
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Cupos</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventosFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No hay eventos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                eventosFiltrados.map((evento) => (
                                    <TableRow key={evento.id}>
                                        <TableCell className="font-medium">{evento.nombre}</TableCell>
                                        <TableCell>
                                            {categorias.find(c => c.id === evento.categoria)?.nombre || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {ubicaciones.find(u => u.id === evento.ubicacion)?.recinto || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {evento.fecha_inicio} - {evento.fecha_fin}
                                        </TableCell>
                                        <TableCell>
                                            {evento.cupos_disponibles}/{evento.cupo_maximo}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getEstadoBadge(evento.estado)}>
                                                {evento.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => abrirModal(evento)}>
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => eliminarEvento(evento.id)} className="text-red-600">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editando ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
                        <DialogDescription>Completa la información del evento</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={guardarEvento} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Nombre *</Label>
                                <Input value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} required />
                            </div>

                            <div className="col-span-2">
                                <Label>Descripción *</Label>
                                <Textarea value={formData.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} rows={3} required />
                            </div>

                            <div>
                                <Label>Categoría *</Label>
                                <Select value={formData.categoria.toString()} onValueChange={(value) => handleChange('categoria', parseInt(value))}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Ubicación *</Label>
                                <Select value={formData.ubicacion.toString()} onValueChange={(value) => handleChange('ubicacion', parseInt(value))}>
                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                    <SelectContent>
                                        {ubicaciones.map((ubi) => (
                                            <SelectItem key={ubi.id} value={ubi.id.toString()}>{ubi.recinto}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Fecha Inicio *</Label>
                                <Input type="date" value={formData.fecha_inicio} onChange={(e) => handleChange('fecha_inicio', e.target.value)} required />
                            </div>

                            <div>
                                <Label>Fecha Fin *</Label>
                                <Input type="date" value={formData.fecha_fin} onChange={(e) => handleChange('fecha_fin', e.target.value)} required />
                            </div>

                            <div className="col-span-2">
                                <Label>Horario *</Label>
                                <Input value={formData.horario} onChange={(e) => handleChange('horario', e.target.value)} placeholder="Ej: Lunes a Viernes 3:00-5:00 PM" required />
                            </div>

                            <div>
                                <Label>Cupo Máximo *</Label>
                                <Input type="number" value={formData.cupo_maximo} onChange={(e) => handleChange('cupo_maximo', parseInt(e.target.value))} required />
                            </div>

                            <div>
                                <Label>Cupos Disponibles *</Label>
                                <Input type="number" value={formData.cupos_disponibles} onChange={(e) => handleChange('cupos_disponibles', parseInt(e.target.value))} required />
                            </div>

                            <div>
                                <Label>Edad Mínima</Label>
                                <Input type="number" value={formData.edad_minima} onChange={(e) => handleChange('edad_minima', e.target.value ? parseInt(e.target.value) : '')} />
                            </div>

                            <div>
                                <Label>Edad Máxima</Label>
                                <Input type="number" value={formData.edad_maxima} onChange={(e) => handleChange('edad_maxima', e.target.value ? parseInt(e.target.value) : '')} />
                            </div>

                            <div className="col-span-2">
                                <Label>Requisitos</Label>
                                <Textarea value={formData.requisitos} onChange={(e) => handleChange('requisitos', e.target.value)} rows={2} />
                            </div>

                            <div>
                                <Label>Estado *</Label>
                                <Select value={formData.estado} onValueChange={(value) => handleChange('estado', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="activo">Activo</SelectItem>
                                        <SelectItem value="inactivo">Inactivo</SelectItem>
                                        <SelectItem value="finalizado">Finalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={cerrarModal}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editando ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default EventosAdmin;