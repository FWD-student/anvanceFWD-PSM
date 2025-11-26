import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/userService';
import inscripcionService from '../../services/inscripcionService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import './profile.css';

function Profile() {
    const [user, setUser] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        loadUserData();
        loadInscripciones();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                navigate('/sesion');
                return;
            }
            setUser(currentUser);
            setFormData({
                username: currentUser.username,
                email: currentUser.email,
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                telefono: currentUser.telefono || '',
                edad: currentUser.edad || '',
                fecha_nacimiento: currentUser.fecha_nacimiento || ''
            });
        } catch (error) {
            console.error('Error cargando usuario:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información del usuario",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadInscripciones = async () => {
        try {
            const data = await inscripcionService.getInscripciones();
            // Filtrar solo las inscripciones del usuario actual
            const currentUser = await authService.getCurrentUser();
            const userInscripciones = data.filter(ins => ins.usuario === currentUser.id);
            setInscripciones(userInscripciones);
        } catch (error) {
            console.error('Error cargando inscripciones:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            await userService.updateUser(user.id, formData);
            setUser({ ...user, ...formData });
            setEditMode(false);
            toast({
                title: "Éxito",
                description: "Información actualizada correctamente"
            });
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la información",
                variant: "destructive"
            });
        }
    };

    const handleCancelInscripcion = async (inscripcionId) => {
        try {
            const token = authService.getToken();
            await inscripcionService.deleteInscripcion(inscripcionId, token);
            setInscripciones(prev => prev.filter(ins => ins.id !== inscripcionId));
            toast({
                title: "Éxito",
                description: "Inscripción cancelada correctamente"
            });
            // Recargar inscripciones
            loadInscripciones();
        } catch (error) {
            console.error('Error cancelando inscripción:', error);
            toast({
                title: "Error",
                description: "No se pudo cancelar la inscripción",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">Mi Perfil</h1>
                    <p className="profile-subtitle">Administra tu información y tus inscripciones</p>
                </div>

                <Tabs defaultValue="datos" className="profile-tabs">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="datos">Mis Datos</TabsTrigger>
                        <TabsTrigger value="inscripciones">Mis Inscripciones</TabsTrigger>
                    </TabsList>

                    <TabsContent value="datos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>
                                    Actualiza tu información personal aquí
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Usuario</Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            value={formData.username || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">Nombre</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Apellido</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <Input
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edad">Edad</Label>
                                        <Input
                                            id="edad"
                                            name="edad"
                                            type="number"
                                            value={formData.edad || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                        <Input
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            type="date"
                                            value={formData.fecha_nacimiento || ''}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    {!editMode ? (
                                        <Button onClick={() => setEditMode(true)}>
                                            Editar Información
                                        </Button>
                                    ) : (
                                        <>
                                            <Button onClick={handleSaveChanges}>
                                                Guardar Cambios
                                            </Button>
                                            <Button variant="outline" onClick={() => {
                                                setEditMode(false);
                                                loadUserData();
                                            }}>
                                                Cancelar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inscripciones">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mis Inscripciones</CardTitle>
                                <CardDescription>
                                    Administra tus inscripciones a eventos deportivos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inscripciones.length > 0 ? (
                                    <div className="space-y-4">
                                        {inscripciones.map((inscripcion) => (
                                            <div key={inscripcion.id} className="inscripcion-item">
                                                <div>
                                                    <h4 className="font-semibold">{inscripcion.evento?.nombre || 'Evento'}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Inscrito el: {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                                                    </p>
                                                    <Badge variant={
                                                        inscripcion.estado === 'confirmada' ? 'default' :
                                                            inscripcion.estado === 'cancelada' ? 'destructive' : 'secondary'
                                                    }>
                                                        {inscripcion.estado}
                                                    </Badge>
                                                </div>
                                                {inscripcion.estado !== 'cancelada' && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleCancelInscripcion(inscripcion.id)}
                                                    >
                                                        Cancelar Inscripción
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No tienes inscripciones activas</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default Profile;