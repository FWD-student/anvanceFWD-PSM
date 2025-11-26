import React, { useState, useEffect } from 'react';
import eventoService from '../../services/eventoService';
import authService from '../../services/authService';
import inscripcionService from '../../services/inscripcionService';
import './carruselEvent.css';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast"


function CaruselEvent() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const data = await eventoService.getEventos();
                // Filtrar solo los eventos activos si es necesario
                setEventos(data);
            } catch (error) {
                console.error("Error cargando eventos para el carrusel:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };

        fetchEventos();
        checkAuth();
    }, []);

    const handleInscribirse = async (eventoId, eventoNombre) => {
        if (!isAuthenticated) {
            toast({
                title: "Inicia sesión",
                description: "Debes iniciar sesión para inscribirte",
                variant: "destructive"
            });
            return;
        }

        try {
            const token = authService.getToken();
            const currentUser = await authService.getCurrentUser();

            const inscripcionData = {
                usuario: currentUser.id,
                evento: eventoId,
                estado: 'pendiente'
            };

            await inscripcionService.createInscripcion(inscripcionData, token);

            toast({
                title: "¡Inscripción exitosa!",
                description: `Te has inscrito a ${eventoNombre}`
            });

        } catch (error) {
            console.error("Error al inscribirse:", error);
            toast({
                title: "Error",
                description: "No se pudo completar la inscripción",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return <div className="carrusel-container"><p>Cargando eventos...</p></div>;
    }

    return (
        <section className="carrusel-section">
            <div className="carrusel-container">
                <h2 className="carrusel-title">Próximos Eventos</h2>

                {eventos.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl"
                    >
                        <CarouselContent>
                            {eventos.map((evento) => (
                                <CarouselItem key={evento.id} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Card>
                                            <CardContent className="flex flex-col aspect-square items-center justify-center p-6 text-center">
                                                <h3 className="text-xl font-semibold mb-2">{evento.nombre}</h3>
                                                <p className="text-sm text-gray-500 mb-4">{new Date(evento.fecha_inicio).toLocaleDateString()}</p>
                                                <p className="text-sm line-clamp-3 mb-4">{evento.descripcion}</p>
                                                {isAuthenticated && (
                                                    <Button
                                                        onClick={() => handleInscribirse(evento.id, evento.nombre)}
                                                        size="sm"
                                                        className="mt-auto"
                                                    >
                                                        Inscribirse
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                ) : (
                    <p>No hay eventos próximos disponibles.</p>
                )}
            </div>
        </section>
    );
}

export default CaruselEvent;