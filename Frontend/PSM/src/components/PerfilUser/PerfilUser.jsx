import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import categoriaService from '../../services/categoriaService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function PerfilUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const { toast } = useToast();

    // Estado del formulario
    const [formData, setFormData] = useState({
        telefono: '',
        edad: '',
        fecha_nacimiento: '',
        intereses: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (!currentUser) {
                    // Redirigir o mostrar mensaje si no hay usuario
                    setLoading(false);
                    return;
                }
                setUser(currentUser);

                // Cargar categorías para intereses
                const cats = await categoriaService.getCategEventos();
                setCategorias(cats);

                // Inicializar formulario
                setFormData({
                    telefono: currentUser.telefono || '',
                    edad: currentUser.edad || '',
                    fecha_nacimiento: currentUser.fecha_nacimiento || '',
                    intereses: currentUser.intereses || []
                });

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

        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            // Validaciones simples (frontend)
            if (formData.edad && (formData.edad < 0 || formData.edad > 120)) {
                toast({ title: "Error", description: "La edad debe ser válida", variant: "destructive" });
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

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Debes iniciar sesión para ver tu perfil.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Mi Perfil</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                {/* Datos Personales (Solo lectura y Editables) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Gestiona tus datos de contacto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input value={user.first_name} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido</Label>
                                    <Input value={user.last_name} disabled className="bg-muted" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input value={user.email} disabled className="bg-muted" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input 
                                    id="telefono" 
                                    name="telefono" 
                                    value={formData.telefono} 
                                    onChange={handleChange} 
                                    placeholder="Ej: 88888888"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edad">Edad</Label>
                                    <Input 
                                        id="edad" 
                                        name="edad" 
                                        type="number" 
                                        value={formData.edad} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                    <Input 
                                        id="fecha_nacimiento" 
                                        name="fecha_nacimiento" 
                                        type="date" 
                                        value={formData.fecha_nacimiento} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={saving} className="w-full">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar Cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Intereses Deportivos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Intereses</CardTitle>
                        <CardDescription>Selecciona los deportes que te interesan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            {categorias.map(categoria => (
                                <div key={categoria.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent transition-colors">
                                    <Checkbox 
                                        id={`cat-${categoria.id}`} 
                                        checked={formData.intereses.includes(categoria.id)}
                                        onCheckedChange={() => handleInteresChange(categoria.id)}
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
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold mb-2">Tus intereses seleccionados:</h4>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PerfilUser;