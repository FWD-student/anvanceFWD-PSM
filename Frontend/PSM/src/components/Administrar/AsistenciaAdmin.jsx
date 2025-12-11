import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import InscripcionService from '../../services/inscripcionService';
import EventoService from '../../services/eventoService';

function AsistenciaAdmin() {
    const [eventos, setEventos] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        cargarEventos();
    }, []);

    useEffect(() => {
        if (selectedEventoId) {
            cargarInscripciones(selectedEventoId);
        } else {
            setInscripciones([]);
        }
    }, [selectedEventoId]);

    const cargarEventos = async () => {
        try {
            const data = await EventoService.getEventos();
            setEventos(data);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarInscripciones = async (eventoId) => {
        try {
            const allInscripciones = await InscripcionService.getInscripciones();
            // Filtrar por evento y por estado (opcional: solo confirmadas?)
            // El usuario pidió "lista de asistencia", asumimos confirmados pero mostramos todos.
            const filtered = allInscripciones.filter(i => i.evento_id === parseInt(eventoId) || i.evento === parseInt(eventoId));
            setInscripciones(filtered);
        } catch (error) {
            console.error('Error al cargar inscripciones:', error);
        }
    };

    const toggleAsistencia = async (inscripcionId, currentAsistio) => {
        const token = localStorage.getItem('token');
        const nuevoAsistio = !currentAsistio;

        try {
            // Usamos patch para actualizar solo el campo asistio
            // OJO: usar inscripcionService.updateInscripcion que ya hace PATCH
            await InscripcionService.updateInscripcion(inscripcionId, { asistio: nuevoAsistio }, token);
            
            // Actualizar estado local
            setInscripciones(prev => 
                prev.map(ins => ins.id === inscripcionId ? { ...ins, asistio: nuevoAsistio } : ins)
            );

            toast({
                title: "Asistencia actualizada",
                description: `Asistencia ${nuevoAsistio ? 'marcada' : 'desmarcada'} correctamente.`,
                className: "bg-green-500 text-white",
                duration: 2000,
            });

        } catch (error) {
            console.error('Error al actualizar asistencia:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar la asistencia.",
            });
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Control de Asistencia</h1>
                <p className="text-muted-foreground mt-1">Marca los usuarios que concluyeron el evento</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="mb-6 max-w-md">
                        <Label className="mb-2 block">Selecciona un Evento</Label>
                        <Select value={selectedEventoId} onValueChange={setSelectedEventoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar evento..." />
                            </SelectTrigger>
                            <SelectContent>
                                {eventos.map(evento => (
                                    <SelectItem key={evento.id} value={evento.id.toString()}>
                                        {evento.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedEventoId && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Estado Inscripción</TableHead>
                                    <TableHead>Asistencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inscripciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No hay inscripciones para este evento
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inscripciones.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">
                                                Usuario #{inv.usuario} 
                                                {/* Idealmente aqui iría el nombre real si el backend lo devuelve. 
                                                    si no, solo ID o requeriría otro fetch. */}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${inv.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 
                                                      inv.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {inv.estado.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox 
                                                        id={`asistio-${inv.id}`}
                                                        checked={inv.asistio || false}
                                                        onCheckedChange={() => toggleAsistencia(inv.id, inv.asistio)}
                                                        disabled={inv.estado !== 'confirmada'} // Solo si está confirmada tiene sentido? O no?
                                                    />
                                                    <Label 
                                                        htmlFor={`asistio-${inv.id}`}
                                                        className="cursor-pointer font-medium"
                                                    >
                                                        Concluyó el evento
                                                    </Label>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AsistenciaAdmin;