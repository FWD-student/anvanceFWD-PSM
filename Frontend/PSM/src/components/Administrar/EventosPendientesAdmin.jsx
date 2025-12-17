import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Check, X, Edit, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import eventoPendienteService from '../../services/eventoPendienteService.jsx';

// Componente para aprobar o rechazar eventos de WhatsApp
// Auto-refresca cada 30 segundos
function EventosPendientesAdmin() {
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState(null);
    const [editando, setEditando] = useState(null);
    const [datosEdicion, setDatosEdicion] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({ open: false, tipo: '', token: '' });
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarPendientes();
        const interval = setInterval(cargarPendientes, 30000);
        return () => clearInterval(interval);
    }, []);

    // Obtiene eventos pendientes del backend
    const cargarPendientes = async () => {
        try {
            const data = await eventoPendienteService.getPendientes();
            setPendientes(data.pendientes || []);
        } catch (error) {
            console.error('Error cargando pendientes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Aprueba evento y lo crea en la base de datos
    const aprobarEvento = async (eventoToken) => {
        setProcesando(true);
        try {
            await eventoPendienteService.aprobarEvento(eventoToken, editando === eventoToken ? datosEdicion : {});
            cargarPendientes();
            setConfirmDialog({ open: false, tipo: '', token: '' });
            setEditando(null);
        } catch (error) {
            console.error('Error aprobando evento:', error);
        } finally {
            setProcesando(false);
        }
    };

    const rechazarEvento = async (eventoToken) => {
        setProcesando(true);
        try {
            await eventoPendienteService.rechazarEvento(eventoToken);
            cargarPendientes();
            setConfirmDialog({ open: false, tipo: '', token: '' });
        } catch (error) {
            console.error('Error rechazando evento:', error);
        } finally {
            setProcesando(false);
        }
    };

    const iniciarEdicion = (evento) => {
        setEditando(evento.token);
        setDatosEdicion({ ...evento.datos });
        setExpandido(evento.token);
    };

    const cancelarEdicion = () => {
        setEditando(null);
        setDatosEdicion({});
    };

    const actualizarCampo = (campo, valor) => {
        setDatosEdicion(prev => ({ ...prev, [campo]: valor }));
    };

    // Formatea fecha a formato legible
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return 'Sin fecha';
        const fecha = new Date(fechaStr + 'T00:00:00');
        return fecha.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Calcula tiempo transcurrido desde creacion
    const tiempoTranscurrido = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diff = Math.floor((ahora - fecha) / 1000 / 60);
        if (diff < 1) return 'Hace un momento';
        if (diff < 60) return `Hace ${diff} min`;
        if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
        return `Hace ${Math.floor(diff / 1440)} días`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Eventos Pendientes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Eventos de WhatsApp esperando aprobación</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cargarPendientes}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white rounded-xl hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 font-medium"
                >
                    <RefreshCw size={18} />
                    Actualizar
                </motion.button>
            </div>

            {pendientes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Clock className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No hay eventos pendientes</h3>
                        <p className="text-gray-400 mt-2">Los eventos enviados por WhatsApp aparecerán aquí</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendientes.map((evento) => (
                        <motion.div key={evento.token} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">{evento.datos?.nombre || 'Sin nombre'}</CardTitle>
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                                    <Clock className="w-3 h-3 mr-1" /> Pendiente
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span>Token: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{evento.token}</code></span>
                                                <span>{tiempoTranscurrido(evento.creado_en)}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setExpandido(expandido === evento.token ? null : evento.token)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            {expandido === evento.token ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </CardHeader>

                                <AnimatePresence>
                                    {expandido === evento.token && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <CardContent className="pt-0 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    {evento.imagen_url && (
                                                        <div className="md:col-span-2">
                                                            <label className="text-sm font-medium text-gray-500 mb-2 block">Imagen Original</label>
                                                            <img src={evento.imagen_url} alt="Afiche" className="max-h-64 rounded-lg border shadow-sm" />
                                                        </div>
                                                    )}

                                                    {editando === evento.token ? (
                                                        <>
                                                            <div><label className="text-sm font-medium text-gray-500">Nombre</label><Input value={datosEdicion.nombre || ''} onChange={(e) => actualizarCampo('nombre', e.target.value)} className="mt-1" /></div>
                                                            <div><label className="text-sm font-medium text-gray-500">Categoría</label><Input value={datosEdicion.categoria_nombre || ''} onChange={(e) => actualizarCampo('categoria_nombre', e.target.value)} className="mt-1" /></div>
                                                            <div><label className="text-sm font-medium text-gray-500">Ubicación</label><Input value={datosEdicion.ubicacion_nombre || ''} onChange={(e) => actualizarCampo('ubicacion_nombre', e.target.value)} className="mt-1" /></div>
                                                            <div><label className="text-sm font-medium text-gray-500">Fecha Inicio</label><Input type="date" value={datosEdicion.fecha_inicio || ''} onChange={(e) => actualizarCampo('fecha_inicio', e.target.value)} className="mt-1" /></div>
                                                            <div><label className="text-sm font-medium text-gray-500">Hora Inicio</label><Input type="time" value={datosEdicion.hora_inicio || ''} onChange={(e) => actualizarCampo('hora_inicio', e.target.value)} className="mt-1" /></div>
                                                            <div><label className="text-sm font-medium text-gray-500">Hora Fin</label><Input type="time" value={datosEdicion.hora_fin || ''} onChange={(e) => actualizarCampo('hora_fin', e.target.value)} className="mt-1" /></div>
                                                            <div className="md:col-span-2"><label className="text-sm font-medium text-gray-500">Descripción</label><textarea value={datosEdicion.descripcion || ''} onChange={(e) => actualizarCampo('descripcion', e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" rows={3} /></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div><span className="text-sm font-medium text-gray-500">Descripción</span><p className="text-gray-800 dark:text-gray-200 mt-1">{evento.datos?.descripcion || 'Sin descripción'}</p></div>
                                                            <div><span className="text-sm font-medium text-gray-500">Categoría</span><p className="text-gray-800 dark:text-gray-200 mt-1">{evento.datos?.categoria_nombre || 'Sin categoría'}</p></div>
                                                            <div><span className="text-sm font-medium text-gray-500">Ubicación</span><p className="text-gray-800 dark:text-gray-200 mt-1">{evento.datos?.ubicacion_nombre || 'Sin ubicación'}</p></div>
                                                            <div><span className="text-sm font-medium text-gray-500">Fecha</span><p className="text-gray-800 dark:text-gray-200 mt-1">{formatearFecha(evento.datos?.fecha_inicio)}</p></div>
                                                            <div><span className="text-sm font-medium text-gray-500">Horario</span><p className="text-gray-800 dark:text-gray-200 mt-1">{evento.datos?.hora_inicio || '--:--'} - {evento.datos?.hora_fin || '--:--'}</p></div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 pt-4 border-t">
                                                    {editando === evento.token ? (
                                                        <>
                                                            <Button onClick={() => setConfirmDialog({ open: true, tipo: 'aprobar', token: evento.token })} className="bg-green-600 hover:bg-green-700 gap-2"><Check className="w-4 h-4" /> Guardar y Aprobar</Button>
                                                            <Button variant="outline" onClick={cancelarEdicion}>Cancelar</Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button onClick={() => setConfirmDialog({ open: true, tipo: 'aprobar', token: evento.token })} className="bg-green-600 hover:bg-green-700 gap-2"><Check className="w-4 h-4" /> Aprobar</Button>
                                                            <Button variant="outline" onClick={() => iniciarEdicion(evento)} className="gap-2"><Edit className="w-4 h-4" /> Editar</Button>
                                                            <Button variant="destructive" onClick={() => setConfirmDialog({ open: true, tipo: 'rechazar', token: evento.token })} className="gap-2"><X className="w-4 h-4" /> Rechazar</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmDialog.tipo === 'aprobar' ? '¿Aprobar evento?' : '¿Rechazar evento?'}</DialogTitle>
                        <DialogDescription>{confirmDialog.tipo === 'aprobar' ? 'El evento será creado y visible en la plataforma.' : 'El evento pendiente será eliminado.'}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog({ open: false, tipo: '', token: '' })} disabled={procesando}>Cancelar</Button>
                        <Button variant={confirmDialog.tipo === 'aprobar' ? 'default' : 'destructive'} onClick={() => confirmDialog.tipo === 'aprobar' ? aprobarEvento(confirmDialog.token) : rechazarEvento(confirmDialog.token)} disabled={procesando} className={confirmDialog.tipo === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : ''}>
                            {procesando && <RefreshCw className="w-4 h-4 animate-spin mr-2" />}
                            {confirmDialog.tipo === 'aprobar' ? 'Sí, aprobar' : 'Sí, rechazar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default EventosPendientesAdmin;