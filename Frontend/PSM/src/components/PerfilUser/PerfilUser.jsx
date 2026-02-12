import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import categoriaService from '../../services/categoriaService';
import inscripcionService from '../../services/inscripcionService';
import configService from '../../services/configService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Clock, X, User, Heart, ClipboardList, LogOut, ChevronRight, Home, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlternadorTema } from '../ui/alternador-tema';
import './perfilUser.css';

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

// Variantes de animación para las transiciones
const contentVariants = {
    initial: { 
        opacity: 0, 
        x: 30,
        scale: 0.98
    },
    animate: { 
        opacity: 1, 
        x: 0,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: { 
        opacity: 0, 
        x: -30,
        scale: 0.98,
        transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

function PerfilUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [loadingInscripciones, setLoadingInscripciones] = useState(true);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [inscripcionACancelar, setInscripcionACancelar] = useState(null);
    const [activeSection, setActiveSection] = useState('personal');
    const [isExiting, setIsExiting] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Estado para la configuración de campos editables
    const [config, setConfig] = useState({
        nombre_editable: true,
        apellido_editable: true, // Mantener para compatibilidad
        primer_apellido_editable: true,
        segundo_apellido_editable: true,
        telefono_editable: true,
        fecha_nacimiento_editable: true,
        email_editable: true,
        intereses_editable: true
    });

    // Estado del formulario
    const [formData, setFormData] = useState({
        first_name: '',
        primer_apellido: '',
        segundo_apellido: '',
        email: '',
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        intereses: [],
        recibir_notificaciones: true,
        dias_anticipacion_notificacion: 1
    });

    const menuItems = [
        { id: 'personal', label: 'Información Personal', icon: User, description: 'Tus datos de contacto' },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell, description: 'Preferencias de avisos' },
        { id: 'intereses', label: 'Mis Intereses', icon: Heart, description: 'Deportes que te gustan' },
        { id: 'inscripciones', label: 'Mis Inscripciones', icon: ClipboardList, description: 'Eventos registrados' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    // Cargar datos del usuario, categorías e inscripciones
    const loadData = async () => {
        try {
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

            const cats = await categoriaService.getCategEventos();
            setCategorias(cats);

            setFormData({
                first_name: currentUser.first_name || '',
                primer_apellido: currentUser.primer_apellido || '',
                segundo_apellido: currentUser.segundo_apellido || '',
                email: currentUser.email || '',
                telefono: currentUser.telefono || '',
                edad: currentUser.edad || calcularEdad(currentUser.fecha_nacimiento),
                fecha_nacimiento: currentUser.fecha_nacimiento || '',
                intereses: currentUser.intereses || [],
                recibir_notificaciones: currentUser.recibir_notificaciones !== false,
                dias_anticipacion_notificacion: currentUser.dias_anticipacion_notificacion || 1
            });

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

    // Manejo de cambios del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        
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

    // funcion del enviado del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (formData.edad && (formData.edad < 0 || formData.edad > 120)) {
                toast({ title: "Error", description: "La edad debe ser válida", variant: "destructive" });
                setSaving(false);
                return;
            }

            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast({ title: "Error", description: "El correo electrónico no es válido", variant: "destructive" });
                setSaving(false);
                return;
            }

            await authService.updateProfile(user.id, formData);
            
            toast({
                title: "Perfil actualizado",
                description: "Tus datos se han guardado correctamente."
            });
            
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
            pendiente: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
            confirmada: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            cancelada: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
        };
        return variants[estado] || variants.pendiente;
    };

    // Navegación con transición de salida
    const handleGoHome = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/');
        }, 300);
    };

    const handleLogout = () => {
        setIsExiting(true);
        setTimeout(() => {
            authService.logout();
            navigate('/sesion');
        }, 300);
    };

    // Obtener iniciales del usuario
    const getInitials = () => {
        if (!user) return '?';
        const first = user.first_name?.charAt(0) || '';
        const last = user.primer_apellido?.charAt(0) || '';
        return (first + last).toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '?';
    };

    if (loading) {
        return (
            <div className="perfil-loading">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="perfil-no-session">
                <User className="h-16 w-16 text-muted-foreground/50" />
                <p>Debes iniciar sesión para ver tu perfil.</p>
                <Button onClick={() => navigate('/sesion')}>Iniciar Sesión</Button>
            </div>
        );
    }

    return (
        <motion.div 
            className="perfil-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.98 : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {/* Sidebar */}
            <aside className="perfil-sidebar">
                {/* Top bar: Home + Theme */}
                <div className="perfil-topbar">
                    <button onClick={handleGoHome} className="perfil-home-btn">
                        <Home size={18} />
                        <span>Inicio</span>
                    </button>
                    <AlternadorTema />
                </div>

                {/* Avatar y nombre */}
                <div className="perfil-sidebar-header">
                    <motion.div 
                        className="perfil-avatar"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {getInitials()}
                    </motion.div>
                    <motion.div 
                        className="perfil-user-info"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <h2>{user.first_name} {user.primer_apellido} {user.segundo_apellido}</h2>
                        <p>{user.email}</p>
                        {user.last_login && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Última conexión: {new Date(user.last_login).toLocaleDateString('es-CR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* Navegación */}
                <nav className="perfil-nav">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        
                        return (
                            <motion.button
                                key={item.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.08, duration: 0.3 }}
                                onClick={() => setActiveSection(item.id)}
                                className={`perfil-nav-item ${isActive ? 'active' : ''}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="perfil-nav-indicator"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className="perfil-nav-icon" size={22} />
                                <div className="perfil-nav-text">
                                    <span className="perfil-nav-label">{item.label}</span>
                                    <span className="perfil-nav-desc">{item.description}</span>
                                </div>
                                <ChevronRight className={`perfil-nav-arrow ${isActive ? 'visible' : ''}`} size={18} />
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer: Logout */}
                <div className="perfil-sidebar-footer">
                    <button onClick={() => setConfirmLogoutOpen(true)} className="perfil-logout-btn">
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="perfil-main">
                <AnimatePresence mode="wait">
                    {/* Sección: Información Personal */}
                    {activeSection === 'personal' && (
                        <motion.div
                            key="personal"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="perfil-section"
                        >
                            <div className="perfil-section-header">
                                <h1>Información Personal</h1>
                                <p>Gestiona tus datos de contacto</p>
                            </div>

                            <Card className="perfil-card">
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="perfil-form">
                                        <div className="perfil-form-grid">
                                            <div className="perfil-form-group">
                                                <Label htmlFor="first_name">Nombre</Label>
                                                <Input 
                                                    id="first_name"
                                                    name="first_name"
                                                    value={formData.first_name} 
                                                    onChange={handleChange}
                                                    disabled={!config.nombre_editable} 
                                                    className={!config.nombre_editable ? "bg-muted/50" : ""}
                                                />
                                                {!config.nombre_editable && <span className="perfil-field-hint">No editable</span>}
                                            </div>
                                            <div className="perfil-form-group">
                                                <Label htmlFor="primer_apellido">Primer Apellido</Label>
                                                <Input 
                                                    id="primer_apellido"
                                                    name="primer_apellido"
                                                    value={formData.primer_apellido} 
                                                    onChange={handleChange}
                                                    disabled={!config.primer_apellido_editable} 
                                                    className={!config.primer_apellido_editable ? "bg-muted/50" : ""}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="perfil-form-grid">
                                            <div className="perfil-form-group">
                                                <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
                                                <Input 
                                                    id="segundo_apellido"
                                                    name="segundo_apellido"
                                                    value={formData.segundo_apellido} 
                                                    onChange={handleChange}
                                                    disabled={!config.segundo_apellido_editable} 
                                                    className={!config.segundo_apellido_editable ? "bg-muted/50" : ""}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="perfil-form-group">
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input 
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={!config.email_editable}
                                                className={!config.email_editable ? "bg-muted/50" : ""}
                                            />
                                        </div>

                                        <div className="perfil-form-group">
                                            <Label htmlFor="telefono">Teléfono</Label>
                                            <Input 
                                                id="telefono" 
                                                name="telefono" 
                                                value={formData.telefono} 
                                                onChange={handleChange} 
                                                placeholder="Ej: 88888888"
                                                disabled={!config.telefono_editable}
                                                className={!config.telefono_editable ? "bg-muted/50" : ""}
                                            />
                                        </div>

                                        <div className="perfil-form-grid">
                                            <div className="perfil-form-group">
                                                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                                <Input 
                                                    id="fecha_nacimiento" 
                                                    name="fecha_nacimiento" 
                                                    type="date" 
                                                    value={formData.fecha_nacimiento} 
                                                    onChange={handleChange} 
                                                    disabled={!config.fecha_nacimiento_editable}
                                                    className={!config.fecha_nacimiento_editable ? "bg-muted/50" : ""}
                                                />
                                            </div>
                                            <div className="perfil-form-group">
                                                <Label>Edad</Label>
                                                <Input 
                                                    value={formData.edad} 
                                                    disabled 
                                                    className="bg-muted/50"
                                                    placeholder="Se calcula automáticamente"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={saving} className="perfil-save-btn">
                                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Guardar Cambios
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Sección: Notificaciones */}
                    {activeSection === 'notificaciones' && (
                        <motion.div
                            key="notificaciones"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="perfil-section"
                        >
                            <div className="perfil-section-header">
                                <h1>Notificaciones</h1>
                                <p>Configura cómo quieres recibir avisos de tus eventos</p>
                            </div>

                            <Card className="perfil-card">
                                <CardContent className="pt-6 space-y-6">
                                    {/* Toggle para recibir notificaciones */}
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Recibir notificaciones por email</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Te enviaremos recordatorios antes de tus eventos
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.recibir_notificaciones}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    recibir_notificaciones: e.target.checked
                                                }))}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {/* Selector de días de anticipación */}
                                    {formData.recibir_notificaciones && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    ¿Con cuántos días de anticipación?
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Recibirás un email recordatorio {formData.dias_anticipacion_notificacion === 1 
                                                        ? '1 día' 
                                                        : `${formData.dias_anticipacion_notificacion} días`} antes del evento
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {[1, 2, 3, 4, 5, 6, 7].map((dia) => (
                                                    <button
                                                        type="button"
                                                        key={dia}
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            dias_anticipacion_notificacion: dia
                                                        }))}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                            formData.dias_anticipacion_notificacion === dia
                                                                ? 'bg-blue-600 text-white shadow-md'
                                                                : 'bg-muted hover:bg-muted/80 text-foreground'
                                                        }`}
                                                    >
                                                        {dia} {dia === 1 ? 'día' : 'días'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        onClick={handleSubmit} 
                                        disabled={saving} 
                                        className="perfil-save-btn"
                                    >
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Guardar Preferencias
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Sección: Intereses */}
                    {activeSection === 'intereses' && (
                        <motion.div
                            key="intereses"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="perfil-section"
                        >
                            <div className="perfil-section-header">
                                <h1>Mis Intereses</h1>
                                <p>Selecciona los deportes que te interesan</p>
                                {!config.intereses_editable && (
                                    <span className="perfil-edit-disabled">Edición desactivada por admin</span>
                                )}
                            </div>

                            <Card className="perfil-card">
                                <CardContent className="pt-6">
                                    <div className="perfil-intereses-grid">
                                        {categorias.map((categoria, index) => (
                                            <motion.div 
                                                key={categoria.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`perfil-interes-item ${formData.intereses.includes(categoria.id) ? 'selected' : ''}`}
                                                onClick={() => config.intereses_editable && handleInteresChange(categoria.id)}
                                            >
                                                <Checkbox 
                                                    id={`cat-${categoria.id}`} 
                                                    checked={formData.intereses.includes(categoria.id)}
                                                    onCheckedChange={() => handleInteresChange(categoria.id)}
                                                    disabled={!config.intereses_editable}
                                                />
                                                <Label htmlFor={`cat-${categoria.id}`} className="perfil-interes-label">
                                                    {categoria.nombre}
                                                </Label>
                                            </motion.div>
                                        ))}
                                    </div>
                                    
                                    {categorias.length === 0 && (
                                        <p className="text-muted-foreground text-center py-8">No hay categorías disponibles.</p>
                                    )}

                                    <div className="perfil-intereses-summary">
                                        <h4>Tus intereses seleccionados:</h4>
                                        <div className="perfil-badges">
                                            {formData.intereses.length > 0 ? (
                                                formData.intereses.map(id => {
                                                    const cat = categorias.find(c => c.id === id);
                                                    return cat ? (
                                                        <Badge key={id} className="perfil-badge">
                                                            {cat.nombre}
                                                        </Badge>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Ninguno seleccionado</span>
                                            )}
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleSubmit} 
                                        disabled={saving || !config.intereses_editable} 
                                        className="perfil-save-btn"
                                    >
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Guardar Intereses
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Sección: Inscripciones */}
                    {activeSection === 'inscripciones' && (
                        <motion.div
                            key="inscripciones"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="perfil-section"
                        >
                            <div className="perfil-section-header">
                                <h1>Mis Inscripciones</h1>
                                <p>Eventos en los que estás inscrito</p>
                            </div>

                            <div className="perfil-inscripciones">
                                {loadingInscripciones ? (
                                    <div className="perfil-inscripciones-loading">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                ) : inscripciones.length === 0 ? (
                                    <Card className="perfil-card perfil-empty-state">
                                        <CardContent className="py-12 text-center">
                                            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                                            <p className="text-muted-foreground">No tienes inscripciones activas.</p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-4"
                                                onClick={() => navigate('/calendario')}
                                            >
                                                Explorar Eventos
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="perfil-inscripciones-list">
                                        {inscripciones.map((inscripcion, index) => (
                                            <motion.div
                                                key={inscripcion.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.08 }}
                                            >
                                                <Card className="perfil-inscripcion-card">
                                                    <CardContent className="py-4">
                                                        <div className="perfil-inscripcion-header">
                                                            <h4>{inscripcion.evento_nombre}</h4>
                                                            <Badge className={`perfil-estado-badge ${getEstadoBadge(inscripcion.estado)}`}>
                                                                {inscripcion.estado}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="perfil-inscripcion-details">
                                                            <div className="perfil-inscripcion-detail">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{inscripcion.evento_fecha_inicio}</span>
                                                            </div>
                                                            {inscripcion.evento_hora_inicio && (
                                                                <div className="perfil-inscripcion-detail">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{formatearHora(inscripcion.evento_hora_inicio)} - {formatearHora(inscripcion.evento_hora_fin)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {inscripcion.estado !== 'cancelada' && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="perfil-cancel-btn"
                                                                onClick={() => abrirConfirmacionCancelar(inscripcion)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Cancelar inscripción
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Dialog de confirmación de cancelación */}
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

            {/* Dialog de confirmación de cerrar sesión */}
            <Dialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Cerrar sesión?</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu perfil.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmLogoutOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleLogout}>Sí, cerrar sesión</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default PerfilUser;