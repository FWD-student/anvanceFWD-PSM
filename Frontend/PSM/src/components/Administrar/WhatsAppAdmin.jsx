import React, { useState, useEffect } from 'react';
import whatsappService from '../../services/whatsappService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Copy, RefreshCw, Clock, Shield, CheckCircle } from "lucide-react";
import { motion } from 'framer-motion';

function WhatsAppAdmin() {
    const [codigoData, setCodigoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        cargarCodigo();
    }, []);

    const cargarCodigo = async () => {
        setLoading(true);
        try {
            const data = await whatsappService.obtenerCodigo();
            setCodigoData(data);
        } catch (error) {
            setCodigoData({ activo: false });
        }
        setLoading(false);
    };

    const handleGenerarCodigo = async () => {
        setGenerating(true);
        try {
            const data = await whatsappService.generarCodigo();
            setCodigoData({ ...data, activo: true });
            toast({
                title: "Codigo generado",
                description: "Copia el codigo y envialo por WhatsApp para autorizar operaciones."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo generar el codigo",
                variant: "destructive"
            });
        }
        setGenerating(false);
    };

    const handleCopiarCodigo = () => {
        if (codigoData?.codigo) {
            navigator.clipboard.writeText(codigoData.codigo);
            setCopied(true);
            toast({
                title: "Codigo copiado",
                description: "Pegalo en el chat de WhatsApp"
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatTiempoRestante = (tiempo) => {
        if (!tiempo) return 'Expirado';
        let parts = [];
        if (tiempo.dias > 0) parts.push(`${tiempo.dias}d`);
        if (tiempo.horas > 0) parts.push(`${tiempo.horas}h`);
        if (tiempo.minutos > 0) parts.push(`${tiempo.minutos}m`);
        return parts.join(' ') || 'Expirando...';
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Autenticacion WhatsApp</h2>
            <p className="text-muted-foreground">
                Genera un codigo para autorizar operaciones de n8n desde WhatsApp.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Card del codigo */}
                <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <MessageSquare className="h-5 w-5" />
                            Codigo de Autorizacion
                        </CardTitle>
                        <CardDescription>
                            Envia este codigo por WhatsApp para autorizar la creacion de eventos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {codigoData?.activo ? (
                            <>
                                {/* Codigo grande */}
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative"
                                >
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center border-2 border-green-500/30 shadow-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Tu codigo activo:</p>
                                        <p className="text-4xl font-mono font-bold tracking-widest text-green-600 dark:text-green-400">
                                            {codigoData.codigo}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Tiempo restante */}
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Expira en:</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                        {formatTiempoRestante(codigoData.tiempo_restante)}
                                    </span>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={handleCopiarCodigo} 
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                        {copied ? 'Copiado' : 'Copiar Codigo'}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleGenerarCodigo}
                                        disabled={generating}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-8 text-center">
                                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                        No hay codigo activo. Genera uno para empezar.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleGenerarCodigo} 
                                    disabled={generating}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generar Codigo
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Card de instrucciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Como funciona</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold">1</div>
                            <div>
                                <p className="font-medium">Genera el codigo</p>
                                <p className="text-sm text-muted-foreground">Haz clic en "Generar Codigo" para obtener un codigo valido por 3 dias.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold">2</div>
                            <div>
                                <p className="font-medium">Copialo</p>
                                <p className="text-sm text-muted-foreground">Usa el boton "Copiar" para copiar el codigo al portapapeles.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold">3</div>
                            <div>
                                <p className="font-medium">Autoriza en WhatsApp</p>
                                <p className="text-sm text-muted-foreground">Cuando n8n detecte un nuevo evento, envia el codigo para confirmar/editar/rechazar.</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Seguridad:</strong> Solo tu puedes generar codigos desde este panel. El codigo expira automaticamente despues de 3 dias.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default WhatsAppAdmin;