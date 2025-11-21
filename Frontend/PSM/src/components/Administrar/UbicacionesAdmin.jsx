import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Pencil, Trash2, MapPin, Phone } from 'lucide-react';
import UbicacionService from '../../services/UbicacionService';

function UbicacionesAdmin() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const navigate = useNavigate();

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
            const data = await UbicacionService.getAll();
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
        const token = localStorage.getItem('token');

        if (!formData.recinto || !formData.direccion) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        try {
            if (editando) {
                await UbicacionService.updateUbicacion(editando.id, formData, token);
                alert('Ubicación actualizada correctamente');
            } else {
                await UbicacionService.createUbicacion(formData, token);
                alert('Ubicación creada correctamente');
            }
            cerrarModal();
            cargarUbicaciones();
        } catch (error) {
            console.error('Error al guardar ubicación:', error);
            alert('Error al guardar la ubicación');
        }
    };

    const eliminarUbicacion = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;

        const token = localStorage.getItem('token');
        try {
            await UbicacionService.deleteUbicacion(id, token);
            alert('Ubicación eliminada correctamente');
            cargarUbicaciones();
        } catch (error) {
            console.error('Error al eliminar ubicación:', error);
            alert('Error al eliminar la ubicación');
        }
    };

    if (loading) {
        return (
            <AdminLayout activeTab="ubicaciones">
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="ubicaciones">
        <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ubicaciones</h1>
                        <p className="text-gray-600 mt-1">Administra los recintos deportivos</p>
                    </div>
                    <Button onClick={() => abrirModal()} className="bg-green-600 hover:bg-green-700">
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
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                                                        onClick={() => eliminarUbicacion(ubicacion.id)}
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
            </div>

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
                            <p className="text-xs text-gray-500 mt-1">
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
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                {editando ? 'Actualizar' : 'Crear'} Ubicación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

export default UbicacionesAdmin;