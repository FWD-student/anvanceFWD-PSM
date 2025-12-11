import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UbicacionService from '../../services/ubicacionService';

function UbicacionesAdmin() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [ubicacionAEliminar, setUbicacionAEliminar] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        recinto: '',
        direccion: '',
        telefono_contacto: ''
    });

    useEffect(() => {
        cargarUbicaciones();
    }, []);

    const cargarUbicaciones = async () => {
        try {
            const data = await UbicacionService.getUbicaciones();
            setUbicaciones(data);
        } catch (error) {
            console.error('Error al cargar ubicaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (ubicacion = null) => {
        if (ubicacion) {
            setEditando(ubicacion);
            setFormData({
                recinto: ubicacion.recinto,
                direccion: ubicacion.direccion,
                telefono_contacto: ubicacion.telefono_contacto || ''
            });
        } else {
            setEditando(null);
            setFormData({ recinto: '', direccion: '', telefono_contacto: '' });
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

    const guardarUbicacion = async (e) => {
        e.preventDefault();

        if (!formData.recinto || !formData.direccion) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor completa todos los campos obligatorios.",
            });
            return;
        }

        try {
            if (editando) {
                await UbicacionService.updateUbicacion(editando.id, formData);
                toast({
                    title: "Ubicación actualizada",
                    description: "La ubicación se actualizó correctamente.",
                    className: "bg-green-500 text-white",
                });
            } else {
                await UbicacionService.createUbicacion(formData);
                toast({
                    title: "Ubicación creada",
                    description: "La ubicación se creó correctamente.",
                    className: "bg-green-500 text-white",
                });
            }
            cerrarModal();
            cargarUbicaciones();
        } catch (error) {
            console.error('Error al guardar ubicación:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al guardar la ubicación. Intenta nuevamente.",
            });
        }
    };

    const abrirConfirmacionEliminar = (ubicacion) => {
        setUbicacionAEliminar(ubicacion);
        setConfirmDeleteOpen(true);
    };

    const eliminarUbicacion = async () => {
        if (!ubicacionAEliminar) return;

        try {
            await UbicacionService.deleteUbicacion(ubicacionAEliminar.id);
            toast({
                title: "Ubicación eliminada",
                description: "La ubicación se eliminó correctamente.",
                className: "bg-green-500 text-white",
            });
            cargarUbicaciones();
        } catch (error) {
            console.error('Error al eliminar ubicación:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al eliminar la ubicación. Intenta nuevamente.",
            });
        } finally {
            setConfirmDeleteOpen(false);
            setUbicacionAEliminar(null);
        }
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
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Ubicaciones</h1>
                    <p className="text-muted-foreground mt-1">Administra los recintos deportivos</p>
                </div>
                <Button onClick={() => abrirModal()} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus size={20} className="mr-2" />
                    Nueva Ubicación
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recinto</TableHead>
                                <TableHead>Dirección (Google Maps)</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ubicaciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No hay ubicaciones registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ubicaciones.map((ubicacion) => (
                                    <TableRow key={ubicacion.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-green-600" />
                                                {ubicacion.recinto}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={ubicacion.direccion}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Ver en mapa
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {ubicacion.telefono_contacto || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => abrirModal(ubicacion)}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => abrirConfirmacionEliminar(ubicacion)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editando ? 'Editar Ubicación' : 'Nueva Ubicación'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa la información del recinto deportivo
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={guardarUbicacion} className="space-y-4">
                        <div>
                            <Label htmlFor="recinto">Nombre del Recinto *</Label>
                            <Input
                                id="recinto"
                                value={formData.recinto}
                                onChange={(e) => handleChange('recinto', e.target.value)}
                                placeholder="Ej: Estadio Municipal"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="direccion">URL de Google Maps *</Label>
                            <Input
                                id="direccion"
                                type="url"
                                value={formData.direccion}
                                onChange={(e) => handleChange('direccion', e.target.value)}
                                placeholder="https://maps.google.com/..."
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Copia el enlace desde Google Maps
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
                            <Input
                                id="telefono_contacto"
                                type="tel"
                                value={formData.telefono_contacto}
                                onChange={(e) => handleChange('telefono_contacto', e.target.value)}
                                placeholder="Ej: 2661-1234"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={cerrarModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                                {editando ? 'Actualizar' : 'Crear'} Ubicación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmacion para eliminar */}
            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la ubicación "{ubicacionAEliminar?.recinto}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={eliminarUbicacion}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default UbicacionesAdmin;