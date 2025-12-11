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
import { Checkbox } from '../ui/checkbox';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import eventoService from '../../services/eventoService.jsx';
import ubicacionService from '../../services/ubicacionService.jsx';
import categoriaService from '../../services/categoriaService.jsx';

// Constante para los días de la semana
const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
];

function EventosAdmin() {
    const [eventos, setEventos] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [eventoAEliminar, setEventoAEliminar] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        ubicacion: '',
        fecha_inicio: '',
        fecha_fin: '',
        dias_semana: [],
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: '',
        cupos_disponibles: '',
        edad_minima: '',
        edad_maxima: '',
        requisitos: '',
        imagen: null,
        imagen_url: '',
        estado: 'activo'
    });

    // Estado para errores de validación en tiempo real
    const [erroresCampos, setErroresCampos] = useState({
        fecha_fin: '',
        edad_maxima: '',
        cupos_disponibles: ''
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
        setErroresCampos({ fecha_fin: '', edad_maxima: '', cupos_disponibles: '' });
        
        if (evento) {
            setEditando(evento);
            setFormData({
                nombre: evento.nombre,
                descripcion: evento.descripcion,
                categoria: evento.categoria,
                ubicacion: evento.ubicacion,
                fecha_inicio: evento.fecha_inicio,
                fecha_fin: evento.fecha_fin,
                dias_semana: evento.dias_semana || [],
                hora_inicio: evento.hora_inicio || '',
                hora_fin: evento.hora_fin || '',
                cupo_maximo: evento.cupo_maximo,
                cupos_disponibles: evento.cupos_disponibles,
                edad_minima: evento.edad_minima || '',
                edad_maxima: evento.edad_maxima || '',
                requisitos: evento.requisitos || '',
                imagen: null,
                imagen_url: '',
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
                dias_semana: [],
                hora_inicio: '',
                hora_fin: '',
                cupo_maximo: '',
                cupos_disponibles: '',
                edad_minima: '',
                edad_maxima: '',
                requisitos: '',
                imagen: null,
                imagen_url: '',
                estado: 'activo'
            });
        }
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditando(null);
        setErroresCampos({ fecha_fin: '', edad_maxima: '', cupos_disponibles: '' });
    };

    const manejarCambio = (name, value) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Validaciones en tiempo real
            const nuevosErrores = { ...erroresCampos };

            // Validación de fechas
            if (name === 'fecha_inicio' || name === 'fecha_fin') {
                const inicio = name === 'fecha_inicio' ? value : newData.fecha_inicio;
                const fin = name === 'fecha_fin' ? value : newData.fecha_fin;
                
                if (inicio && fin && new Date(inicio) >= new Date(fin)) {
                    nuevosErrores.fecha_fin = 'La fecha final debe ser posterior a la inicial';
                } else {
                    nuevosErrores.fecha_fin = '';
                }
            }

            // Validación de edades
            if (name === 'edad_minima' || name === 'edad_maxima') {
                const min = name === 'edad_minima' ? parseInt(value) : parseInt(newData.edad_minima || 0);
                const max = name === 'edad_maxima' ? parseInt(value) : parseInt(newData.edad_maxima || 0);
                
                if (min && max && min >= max) {
                    nuevosErrores.edad_maxima = 'La edad máxima debe ser mayor a la mínima';
                } else {
                    nuevosErrores.edad_maxima = '';
                }
            }

            // Validación de cupos
            if (name === 'cupos_disponibles' || name === 'cupo_maximo') {
                const disp = name === 'cupos_disponibles' ? parseInt(value) : parseInt(newData.cupos_disponibles || 0);
                const max = name === 'cupo_maximo' ? parseInt(value) : parseInt(newData.cupo_maximo || 0);
                
                if (disp && max && disp > max) {
                    nuevosErrores.cupos_disponibles = 'Los cupos disponibles no pueden exceder el máximo';
                } else {
                    nuevosErrores.cupos_disponibles = '';
                }
            }

            setErroresCampos(nuevosErrores);
            return newData;
        });
    };

    const guardarEvento = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.descripcion || !formData.categoria || !formData.ubicacion) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor completa todos los campos obligatorios.",
            });
            return;
        }

        // Verificar si hay errores de validación pendientes
        if (erroresCampos.fecha_fin || erroresCampos.edad_maxima || erroresCampos.cupos_disponibles) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor corrige los errores antes de guardar.",
            });
            return;
        }

        //Campo importante para que funcione el envio de archivos
        const data = new FormData();
        // Agregamos todos los campos al FormData
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                // Si es dias_semana (array), convertir a JSON string
                if (key === 'dias_semana' && Array.isArray(formData[key])) {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            }
        });

        try {
            if (editando) {
                await eventoService.updateEvento(editando.id, data);
                toast({
                    title: "Evento actualizado",
                    description: "El evento se actualizó correctamente.",
                    className: "bg-green-500 text-white",
                });
            } else {
                await eventoService.createEvento(data);
                toast({
                    title: "Evento creado",
                    description: "El evento se creó correctamente.",
                    className: "bg-green-500 text-white",
                });
            }
            cerrarModal();
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar evento:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al guardar el evento. Intenta nuevamente.",
            });
        }
    };

    const abrirConfirmacionEliminar = (evento) => {
        setEventoAEliminar(evento);
        setConfirmDeleteOpen(true);
    };

    const eliminarEvento = async () => {
        if (!eventoAEliminar) return;

        try {
            await eventoService.deleteEvento(eventoAEliminar.id);
            toast({
                title: "Evento eliminado",
                description: "El evento se eliminó correctamente.",
                className: "bg-green-500 text-white",
            });
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar evento:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al eliminar el evento. Intenta nuevamente.",
            });
        } finally {
            setConfirmDeleteOpen(false);
            setEventoAEliminar(null);
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
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Eventos</h1>
                    <p className="text-muted-foreground mt-1">Administra los eventos deportivos</p>
                </div>
                <Button onClick={() => abrirModal()} className="bg-green-600 hover:bg-green-700 text-white">
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
                        <span className="text-sm text-muted-foreground">
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
                                <TableHead>Imagen</TableHead>
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
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay eventos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                eventosFiltrados.map((evento) => (
                                    <TableRow key={evento.id}>
                                         <TableCell>
                                            {evento.imagen_id ? (
                                                 <img 
                                                    src={eventoService.getEventoImagenUrl(evento.imagen_id)} 
                                                    alt="Miniatura" 
                                                    className="w-12 h-12 object-cover rounded-md"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                 />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs">Sin img</div>
                                            )}
                                        </TableCell>
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
                                                <Button variant="outline" size="sm" onClick={() => abrirConfirmacionEliminar(evento)} className="text-red-600">
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
                                <Input value={formData.nombre} onChange={(e) => manejarCambio('nombre', e.target.value)} required />
                            </div>

                            <div className="col-span-2">
                                <Label>Descripción *</Label>
                                <Textarea value={formData.descripcion} onChange={(e) => manejarCambio('descripcion', e.target.value)} rows={3} required />
                            </div>

                            <div>
                                <Label>Categoría *</Label>
                                <Select value={formData.categoria.toString()} onValueChange={(value) => manejarCambio('categoria', parseInt(value))}>
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
                                <Select value={formData.ubicacion.toString()} onValueChange={(value) => manejarCambio('ubicacion', parseInt(value))}>
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
                                <Input type="date" value={formData.fecha_inicio} onChange={(e) => manejarCambio('fecha_inicio', e.target.value)} required />
                            </div>

                            <div>
                                <Label>Fecha Fin *</Label>
                                <Input 
                                    type="date" 
                                    value={formData.fecha_fin} 
                                    onChange={(e) => manejarCambio('fecha_fin', e.target.value)} 
                                    min={formData.fecha_inicio}
                                    required 
                                />
                                {erroresCampos.fecha_fin && (
                                    <p className="text-red-500 text-sm mt-1">{erroresCampos.fecha_fin}</p>
                                )}
                            </div>

                            {/* Sección de Días de la Semana */}
                            <div className="col-span-2">
                                <Label className="mb-3 block">Días de la Semana *</Label>
                                <div className="flex items-center gap-2 mb-3">
                                    <Checkbox
                                        id="todos-los-dias"
                                        checked={formData.dias_semana.length === 7}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                manejarCambio('dias_semana', DIAS_SEMANA.map(d => d.id));
                                            } else {
                                                manejarCambio('dias_semana', []);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="todos-los-dias" className="cursor-pointer font-semibold">Todos los días</Label>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {DIAS_SEMANA.map((dia) => (
                                        <div key={dia.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`dia-${dia.id}`}
                                                checked={formData.dias_semana.includes(dia.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        manejarCambio('dias_semana', [...formData.dias_semana, dia.id]);
                                                    } else {
                                                        manejarCambio('dias_semana', formData.dias_semana.filter(d => d !== dia.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`dia-${dia.id}`} className="cursor-pointer text-sm">{dia.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sección de Horario */}
                            <div>
                                <Label>Hora Inicio *</Label>
                                <Input 
                                    type="time" 
                                    value={formData.hora_inicio} 
                                    onChange={(e) => manejarCambio('hora_inicio', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <Label>Hora Fin *</Label>
                                <Input 
                                    type="time" 
                                    value={formData.hora_fin} 
                                    onChange={(e) => manejarCambio('hora_fin', e.target.value)} 
                                    required 
                                />
                            </div>

                            <div>
                                <Label>Cupo Máximo *</Label>
                                <Input type="number" value={formData.cupo_maximo} onChange={(e) => manejarCambio('cupo_maximo', parseInt(e.target.value))} required />
                            </div>

                            <div>
                                <Label>Cupos Disponibles *</Label>
                                <Input type="number" value={formData.cupos_disponibles} onChange={(e) => manejarCambio('cupos_disponibles', parseInt(e.target.value))} required />
                                {erroresCampos.cupos_disponibles && (
                                    <p className="text-red-500 text-sm mt-1">{erroresCampos.cupos_disponibles}</p>
                                )}
                            </div>

                            <div>
                                <Label>Edad Mínima</Label>
                                <Input type="number" value={formData.edad_minima} onChange={(e) => manejarCambio('edad_minima', e.target.value ? parseInt(e.target.value) : '')} />
                            </div>

                            <div>
                                <Label>Edad Máxima</Label>
                                <Input type="number" value={formData.edad_maxima} onChange={(e) => manejarCambio('edad_maxima', e.target.value ? parseInt(e.target.value) : '')} />
                                {erroresCampos.edad_maxima && (
                                    <p className="text-red-500 text-sm mt-1">{erroresCampos.edad_maxima}</p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <Label>Requisitos</Label>
                                <Textarea value={formData.requisitos} onChange={(e) => manejarCambio('requisitos', e.target.value)} rows={2} />
                            </div>

                            <div className="col-span-2">
                                <Label>Imagen (Subir archivo)</Label>
                                <Input type="file" onChange={(e) => manejarCambio('imagen', e.target.files[0])} accept="image/*" />
                            </div>

                            <div className="col-span-2">
                                <Label>Imagen (O URL)</Label>
                                <Input value={formData.imagen_url} onChange={(e) => manejarCambio('imagen_url', e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" />
                            </div>

                            <div>
                                <Label>Estado *</Label>
                                <Select value={formData.estado} onValueChange={(value) => manejarCambio('estado', value)}>
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
                            <Button 
                                type="submit" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={!!erroresCampos.fecha_fin || !!erroresCampos.edad_maxima || !!erroresCampos.cupos_disponibles}
                            >
                                {editando ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación para eliminar */}
            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el evento "{eventoAEliminar?.nombre}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={eliminarEvento}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default EventosAdmin;