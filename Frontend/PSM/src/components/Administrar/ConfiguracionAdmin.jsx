import React, { useState, useEffect } from 'react';
import configService from '../../services/configService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert } from "lucide-react";

function ConfiguracionAdmin() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await configService.getConfig();
            setConfig(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar la configuración",
                variant: "destructive"
            });
        }
        setLoading(false);
    };

    const handleToggle = (key) => {
        setConfig(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await configService.updateConfig(config);
            toast({
                title: "Configuración guardada",
                description: "Las reglas de edición de perfil han sido actualizadas."
            });
        } catch (error) {

            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-full lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Permisos de Edición de Perfil
                        </CardTitle>
                        <CardDescription>
                            Controla qué campos pueden modificar los usuarios en su propio perfil.
                            Desactivar un campo impedirá que cualquier usuario (excepto admins) lo cambie.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Nombre</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su nombre de pila</p>
                            </div>
                            <Switch 
                                checked={config.nombre_editable} 
                                onCheckedChange={() => handleToggle('nombre_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Primer Apellido</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su primer apellido</p>
                            </div>
                            <Switch 
                                checked={config.primer_apellido_editable} 
                                onCheckedChange={() => handleToggle('primer_apellido_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Segundo Apellido</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su segundo apellido</p>
                            </div>
                            <Switch 
                                checked={config.segundo_apellido_editable} 
                                onCheckedChange={() => handleToggle('segundo_apellido_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Correo Electrónico</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su dirección de email</p>
                            </div>
                            <Switch 
                                checked={config.email_editable} 
                                onCheckedChange={() => handleToggle('email_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Teléfono</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su número de contacto</p>
                            </div>
                            <Switch 
                                checked={config.telefono_editable} 
                                onCheckedChange={() => handleToggle('telefono_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Fecha de Nacimiento</Label>
                                <p className="text-sm text-muted-foreground">Permitir cambiar su fecha de nacimiento (y edad)</p>
                            </div>
                            <Switch 
                                checked={config.fecha_nacimiento_editable} 
                                onCheckedChange={() => handleToggle('fecha_nacimiento_editable')} 
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Intereses</Label>
                                <p className="text-sm text-muted-foreground">Permitir seleccionar categorías de interés</p>
                            </div>
                            <Switch 
                                checked={config.intereses_editable} 
                                onCheckedChange={() => handleToggle('intereses_editable')} 
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Configuración
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ConfiguracionAdmin