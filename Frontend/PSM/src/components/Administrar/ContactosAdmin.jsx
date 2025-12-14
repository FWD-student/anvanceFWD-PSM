import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Calendar, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';
import contactoService from '../../services/contactoService';

function ContactosAdmin() {
    const [contactos, setContactos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchContactos();
    }, []);

    const fetchContactos = async () => {
        try {
            const data = await contactoService.getContactos();
            // Ordenar por fecha más reciente
            const sorted = data.sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio));
            setContactos(sorted);
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron cargar los mensajes de contacto'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold tracking-tight">Mensajes de Contacto</h1>
                <p className="text-muted-foreground">
                    {contactos.length} mensaje{contactos.length !== 1 ? 's' : ''} recibido{contactos.length !== 1 ? 's' : ''}
                </p>
            </motion.div>

            {contactos.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Mail className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg">No hay mensajes de contacto</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contactos.map((contacto, index) => (
                        <motion.div
                            key={contacto.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{contacto.nombre}</CardTitle>
                                                <CardDescription className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {contacto.correo}
                                                    </span>
                                                    {contacto.telefono && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {contacto.telefono}
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(contacto.fecha_envio)}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/50 rounded-lg p-4 mt-2">
                                        <p className="text-sm whitespace-pre-wrap">{contacto.mensaje}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ContactosAdmin;