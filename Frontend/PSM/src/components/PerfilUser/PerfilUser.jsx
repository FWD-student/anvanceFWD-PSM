import React, { useState, useEffect } from 'react';
import authService from '../../services/authService.jsx';
import categoriaService from '../../services/categoriaService.jsx';
import inscripcionService from '../../services/inscripcionService.jsx';
import configService from '../../services/configService.jsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Función para calcular edad a partir de fecha de nacimiento
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

function PerfilUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [loadingInscripciones, setLoadingInscripciones] = useState(true);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [inscripcionACancelar, setInscripcionACancelar] = useState(null);
    const { toast } = useToast();

    // Estado para la configuración de campos editables
    const [config, setConfig] = useState({
        nombre_editable: true,
        apellido_editable: true,
        telefono_editable: true,
        fecha_nacimiento_editable: true,
        email_editable: true,
        intereses_editable: true
    });

    // Estado del formulario
    const [formData, setFormData] = useState({
        email: '',
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        intereses: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Cargar configuracion global PRIMERO
            try {
                const configData = await configService.getConfig();
                if (configData) setConfig(configData);
            } catch (err) {


                console.warn("No se pudo cargar config, usando defaults", err);
            }

            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                setLoading(false);
                return;
            }
            setUser(currentUser);

            // Cargar categorías para intereses
            const cats = await categoriaService.getCategEventos();
            setCategorias(cats);

            // Inicializar formulario
            setFormData({
                email: currentUser.email || '',
                telefono: currentUser.telefono || '',
                edad: currentUser.edad || calcularEdad(currentUser.fecha_nacimiento),
                fecha_nacimiento: currentUser.fecha_nacimiento || '',
                intereses: currentUser.intereses || []
            });

            // Cargar inscripciones del usuario
            try {
                const insc = await inscripcionService.getMisInscripciones();
                setInscripciones(insc);
            } catch (error) {
                console.error("Error cargando inscripciones:", error);
            }
            setLoadingInscripciones(false);

        } catch (error) {
            console.error("Error cargando perfil:", error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información del perfil",
                variant: "destructive"
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si cambia la fecha de nacimiento, calcular edad automáticamente
        if (name === 'fecha_nacimiento') {
            const edadCalculada = calcularEdad(value);
            setFormData(prev => ({
                ...prev,
                fecha_nacimiento: value,
                edad: edadCalculada
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleInteresChange = (categoriaId) => {
        setFormData(prev => {
            const intereses = [...prev.intereses];
            if (intereses.includes(categoriaId)) {
                return { ...prev, intereses: intereses.filter(id => id !== categoriaId) };
            } else {
                return { ...prev, intereses: [...intereses, categoriaId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validaciones simples
            if (formData.edad && (formData.edad < 0 || formData.edad > 120)) {
                toast({ title: "Error", description: "La edad debe ser válida", variant: "destructive" });
                setSaving(false);
                return;
            }

            // Validar email
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast({ title: "Error", description: "El correo electrónico no es válido", variant: "destructive" });
                setSaving(false);
                return;
            }

            // Enviar actualización
            await authService.updateProfile(user.id, formData);
            
            toast({
                title: "Perfil actualizado",
                description: "Tus datos se han guardado correctamente."
            });
            
            // Actualizar estado local del usuario
            setUser(prev => ({ ...prev, ...formData }));
            setSaving(false);

        } catch (error) {
            console.error("Error guardando perfil:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el perfil",
                variant: "destructive"
            });
            setSaving(false);
        }
    };

    const abrirConfirmacionCancelar = (inscripcion) => {
        setInscripcionACancelar(inscripcion);
        setConfirmCancelOpen(true);
    };

    const cancelarInscripcion = async () => {
        if (!inscripcionACancelar) return;

        try {
            const token = authService.getToken();
            await inscripcionService.deleteInscripcion(inscripcionACancelar.id, token);
            
            toast({
                title: "Inscripción cancelada",
                description: `Te has dado de baja del evento "${inscripcionACancelar.evento_nombre}"`
            });
            
            // Recargar inscripciones
            const insc = await inscripcionService.getMisInscripciones();
            setInscripciones(insc);
            
        } catch (error) {
            console.error("Error cancelando inscripción:", error);
            toast({
                title: "Error",
                description: "No se pudo cancelar la inscripción",
                variant: "destructive"
            });
        } finally {
            setConfirmCancelOpen(false);
            setInscripcionACancelar(null);
        }
    };

    // Formatear hora para mostrar
    const formatearHora = (horaStr) => {
        if (!horaStr) return '';
        const partes = horaStr.split(':');
        const hora = parseInt(partes[0]);
        const min = partes[1];
        const periodo = hora >= 12 ? 'PM' : 'AM';
        const hora12 = hora > 12 ? hora - 12 : (hora === 0 ? 12 : hora);
        return `${hora12}:${min} ${periodo}`;
    };

    const getEstadoBadge = (estado) => {
        const variants = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            confirmada: 'bg-green-100 text-green-800',
            cancelada: 'bg-red-100 text-red-800'
        };
        return variants[estado] || variants.pendiente;
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Debes iniciar sesión para ver tu perfil.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Mi Perfil</h1>
            
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Columna 1: Datos Personales */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Gestiona tus datos de contacto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input 
                                        value={user.first_name || ''} 
                                        // Siempre deshabilitado o segun config
                                        disabled={!config.nombre_editable} 
                                        className={!config.nombre_editable ? "bg-muted" : ""}
                                    />
                                    {!config.nombre_editable && <span className="text-xs text-muted-foreground">No editable</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido</Label>
                                    <Input 
                                        value={user.last_name || ''} 
                                        disabled={!config.apellido_editable} 
                                        className={!config.apellido_editable ? "bg-muted" : ""}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input 
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!config.email_editable}
                                    className={!config.email_editable ? "bg-muted" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input 
                                    id="telefono" 
                                    name="telefono" 
                                    value={formData.telefono} 
                                    onChange={handleChange} 
                                    placeholder="Ej: 88888888"
                                    disabled={!config.telefono_editable}
                                    className={!config.telefono_editable ? "bg-muted" : ""}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                    <Input 
                                        id="fecha_nacimiento" 
                                        name="fecha_nacimiento" 
                                        type="date" 
                                        value={formData.fecha_nacimiento} 
                                        onChange={handleChange} 
                                        disabled={!config.fecha_nacimiento_editable}
                                        className={!config.fecha_nacimiento_editable ? "bg-muted" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Edad</Label>
                                    <Input 
                                        value={formData.edad} 
                                        disabled 
                                        className="bg-muted"
                                        placeholder="Se calcula automáticamente"
                                    />
                                </div>
                            </div>

                            {/* Mostrar botón solo si hay al menos un campo editable relevante (opcional, por ahora mostrar siempre) */}
                            <Button type="submit" disabled={saving} className="w-full">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar Cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Columna 2: Intereses */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Mis Intereses</CardTitle>
                        <CardDescription>
                            Selecciona los deportes que te interesan
                            {!config.intereses_editable && <span className="block text-red-500 text-xs mt-1">(Edición desactivada por admin)</span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {categorias.map(categoria => (
                                <div key={categoria.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent transition-colors">
                                    <Checkbox 
                                        id={`cat-${categoria.id}`} 
                                        checked={formData.intereses.includes(categoria.id)}
                                        onCheckedChange={() => handleInteresChange(categoria.id)}
                                        disabled={!config.intereses_editable}
                                    />
                                    <Label 
                                        htmlFor={`cat-${categoria.id}`} 
                                        className="flex-1 cursor-pointer font-medium"
                                    >
                                        {categoria.nombre}
                                    </Label>
                                </div>
                            ))}
                            {categorias.length === 0 && <p className="text-muted-foreground">No hay categorías disponibles.</p>}
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Tus intereses:</h4>
                            <div className="flex flex-wrap gap-2">
                                {formData.intereses.length > 0 ? (
                                    formData.intereses.map(id => {
                                        const cat = categorias.find(c => c.id === id);
                                        return cat ? <Badge key={id} variant="secondary">{cat.nombre}</Badge> : null;
                                    })
                                ) : (
                                    <span className="text-sm text-muted-foreground">Ninguno seleccionado</span>
                                )}
                            </div>
                        </div>
                        <Button type="button" onClick={handleSubmit} disabled={saving || !config.intereses_editable} className="w-full mt-4">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Intereses
                        </Button>
                    </CardContent>
                </Card>

                {/* Columna 3: Mis Inscripciones */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Mis Inscripciones</CardTitle>
                        <CardDescription>Eventos en los que estás inscrito</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingInscripciones ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : inscripciones.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No tienes inscripciones activas.</p>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {inscripciones.map(inscripcion => (
                                    <div key={inscripcion.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-sm">{inscripcion.evento_nombre}</h4>
                                            <Badge className={getEstadoBadge(inscripcion.estado)}>
                                                {inscripcion.estado}
                                            </Badge>
                                        </div>
                                        
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{inscripcion.evento_fecha_inicio}</span>
                                            </div>
                                            {inscripcion.evento_hora_inicio && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatearHora(inscripcion.evento_hora_inicio)} - {formatearHora(inscripcion.evento_hora_fin)}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {inscripcion.estado !== 'cancelada' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => abrirConfirmacionCancelar(inscripcion)}
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Cancelar inscripción
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de confirmación para cancelar inscripción */}
            <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar cancelación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cancelar tu inscripción al evento "{inscripcionACancelar?.evento_nombre}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>No, mantener</Button>
                        <Button variant="destructive" onClick={cancelarInscripcion}>Sí, cancelar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PerfilUser;