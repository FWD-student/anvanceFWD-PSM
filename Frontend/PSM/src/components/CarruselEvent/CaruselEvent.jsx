import React, { useState, useEffect } from 'react';
import eventoService from '../../services/eventoService.jsx';
import authService from '../../services/authService.jsx';
import inscripcionService from '../../services/inscripcionService.jsx';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast"


function CaruselEvent() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInterests, setUserInterests] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Verificar autenticación y cargar usuario si aplica
                const isAuth = authService.isAuthenticated();
                setIsAuthenticated(isAuth);
                
                let intereses = [];
                if (isAuth) {
                    try {
                        const user = await authService.getCurrentUser();
                        if (user && user.intereses) {
                            intereses = user.intereses;
                            setUserInterests(intereses);
                        }
                    } catch (e) {
                        console.error("Error cargando usuario para intereses:", e);
                    }
                }

                // Cargar eventos
                const data = await eventoService.getEventos();
                
                // Si hay intereses, ordenar: primero los de intereses
                if (intereses.length > 0) {
                    const sortedData = [...data].sort((a, b) => {
                        const aMatch = intereses.includes(a.categoria);
                        const bMatch = intereses.includes(b.categoria);
                        if (aMatch && !bMatch) return -1;
                        if (!aMatch && bMatch) return 1;
                        return 0;
                    });
                    setEventos(sortedData);
                } else {
                    setEventos(data);
                }
            } catch (error) {
                console.error("Error cargando eventos para el carrusel:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
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
        return <div className="w-full flex justify-center py-10 dark:text-white"><p>Cargando eventos...</p></div>;
    }

    return (
        <section className="w-full flex justify-center py-10 bg-[#f8f9fa] dark:bg-background transition-colors duration-300">
            <div className="w-[90%] max-w-[1200px] flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#333] dark:text-foreground">Próximos Eventos</h2>

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
                                            <CardContent className="flex flex-col aspect-square items-center justify-center p-6 text-center relative">
                                                {userInterests.includes(evento.categoria) && (
                                                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        Recomendado
                                                    </div>
                                                )}
                                                {evento.imagen_id ? (
                                                    <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
                                                        <img 
                                                            src={eventoService.getEventoImagenUrl(evento.imagen_id)} 
                                                            alt={evento.nombre}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null; 
                                                                e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-48 mb-4 bg-gray-200 flex items-center justify-center rounded-md text-gray-400">
                                                        <span className="text-4xl">📷</span>
                                                    </div>
                                                )}
                                                <h3 className="text-xl font-semibold mb-2">{evento.nombre}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                    <span> {new Date(evento.fecha_inicio).toLocaleDateString()}</span>
                                                </div>
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