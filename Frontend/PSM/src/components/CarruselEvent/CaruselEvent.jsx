import React, { useState, useEffect } from 'react';
import eventoService from '../../services/eventoService';
import authService from '../../services/authService';
import inscripcionService from '../../services/inscripcionService';
import ubicacionService from '../../services/ubicacionService'; // Importado para mapeo de nombres
import categoriaService from '../../services/categoriaService'; // Importado para mapeo de categorías/deportes
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast"
import { useModoRendimiento } from '../../hooks/use-modo-rendimiento';
import { MapPin, Clock, CalendarDays } from "lucide-react";

function CaruselEvent() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInterests, setUserInterests] = useState([]);
    const { toast } = useToast();
    const { esGamaBaja, animacionesHabilitadas } = useModoRendimiento();
    
    // Estado para datos crudos y procesados
    const [rawData, setRawData] = useState({ eventos: [], ubicaciones: [], categorias: [] });
    const [eventosProcesados, setEventosProcesados] = useState([]);

    // 1. Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Verificar auth
                const isAuth = authService.isAuthenticated();
                setIsAuthenticated(isAuth);

                if (isAuth) {
                   try {
                        const user = await authService.getCurrentUser();
                        if (user?.intereses) setUserInterests(user.intereses);
                   } catch (e) { console.error(e); }
                }

                // Cargar datos
                const [eventos, ubicaciones, categorias] = await Promise.all([
                    eventoService.getEventos(true),
                    ubicacionService.getUbicaciones(),
                    categoriaService.getCategEventos()
                ]);

                setRawData({ eventos, ubicaciones, categorias });
            } catch (error) {
                console.error("Error cargando datos:", error);
                toast({ title: "Error", description: "No se pudieron cargar los eventos.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // 2. Procesar datos con useMemo
    useEffect(() => {
        if (loading) return;

        const { eventos, ubicaciones, categorias } = rawData;
        
        // Mapas O(1)
        const mapaUbicaciones = ubicaciones.reduce((acc, u) => ({ ...acc, [u.id]: u.recinto }), {});
        const mapaCategorias = categorias.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const procesados = eventos.map(evento => {
            const inicio = new Date(evento.fecha_inicio + 'T00:00:00');
            const fin = new Date(evento.fecha_fin + 'T00:00:00');
            
            return {
                ...evento,
                fechaObj: inicio,
                fechaFinObj: fin,
                ubicacion_nombre: mapaUbicaciones[evento.ubicacion] || 'Por confirmar',
                categoria_info: mapaCategorias[evento.categoria],
                esPasado: fin < now,
                esEnCurso: fin >= now && inicio <= now,
                esFuturo: inicio > now
            };
        });

        // Ordenar y filtrar
        const pasados = procesados.filter(e => e.esPasado).sort((a, b) => b.fechaFinObj - a.fechaFinObj);
        const enCurso = procesados.filter(e => e.esEnCurso).sort((a, b) => a.fechaFinObj - b.fechaFinObj);
        const futuros = procesados.filter(e => e.esFuturo).sort((a, b) => a.fechaObj - b.fechaObj);

        // Priorizar intereses
        if (userInterests.length > 0) {
            futuros.sort((a, b) => {
                const aMatch = userInterests.includes(a.categoria);
                const bMatch = userInterests.includes(b.categoria);
                return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
            });
        }

        setEventosProcesados([
            ...(pasados.length ? [pasados[0]] : []),
            ...enCurso,
            ...futuros
        ]);

    }, [rawData, userInterests, loading]);

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
        <section className="w-full flex justify-center py-10 bg-secondary dark:bg-background transition-colors duration-300">
            <div className="w-[90%] max-w-[1200px] flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mb-8 text-primary">Próximos Eventos</h2>

                {eventosProcesados.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl"
                    >
                        <CarouselContent className="items-start py-14">
                            {eventosProcesados.map((evento) => {
                                const esPasado = evento.esPasado;
                                const esEnCurso = evento.esEnCurso;
                                return (
                                <CarouselItem key={evento.id} className="md:basis-1/2 lg:basis-1/3 pl-4 flex">
                                    <div className="p-1 w-full">
                                        <Card className={`
                                            w-full flex flex-col relative overflow-hidden transition-all duration-300 border-white/20 h-[580px]
                                            ${esPasado 
                                                ? 'bg-gray-100 dark:bg-gray-900 border-gray-200 grayscale opacity-80' 
                                                : esEnCurso
                                                    ? 'bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-lg border-green-400/50 ring-2 ring-green-400/30'
                                                    : 'bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-lg border-white/20'
                                            }
                                            ${!esPasado && !esGamaBaja && animacionesHabilitadas 
                                                ? 'group hover:scale-105 hover:shadow-xl hover:z-10' 
                                                : ''
                                            }
                                        `}>
                                            <CardContent className="flex flex-col flex-grow p-0 relative">
                                                
                                                {/* Imagen */}
                                                <div className="w-full h-48 overflow-hidden relative flex-shrink-0">
                                                    {esPasado && (
                                                        <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                                                            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded uppercase font-bold tracking-widest">Finalizado</span>
                                                        </div>
                                                    )}
                                                    {esEnCurso && (
                                                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                                                            <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded uppercase font-bold tracking-widest shadow-lg animate-pulse">🟢 En Curso</span>
                                                        </div>
                                                    )}
                                                    {userInterests.includes(evento.categoria) && !esPasado && (
                                                        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                                                            Recomendado
                                                        </div>
                                                    )}
                                                    <img 
                                                        src={eventoService.getEventoImagenUrl(evento.imagen_id)} 
                                                        alt={evento.nombre}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
                                                        }}
                                                    />
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex flex-col flex-grow p-4 text-center">
                                                    <h3 className="text-xl font-bold mb-1 line-clamp-1 text-primary">{evento.nombre}</h3>
                                                    
                                                    {/* Badge del Deporte/Categoría */}
                                                    {evento.categoria_info && (
                                                        <span className="inline-block mx-auto mb-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                                            {evento.categoria_info.nombre}
                                                        </span>
                                                    )}
                                                    {/* Fecha Destacada */}
                                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2 font-medium">
                                                        <CalendarDays className="w-4 h-4 text-primary" />
                                                        <span className="capitalize">
                                                            {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm line-clamp-3 mb-3 text-muted-foreground flex-grow">{evento.descripcion}</p>

                                                    {/* Info Oculta / Expandible en Hover (Solo Gama Alta) */}
                                                    {(!esGamaBaja && animacionesHabilitadas && !esPasado) && (
                                                        <div className="h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col gap-2 mb-3 text-xs text-left bg-muted/50 p-3 rounded-lg backdrop-blur-sm border border-border/50 shrink-0">
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <Clock className="w-3 h-3 text-primary shrink-0" />
                                                                <span>
                                                                    {(() => {
                                                                        // Formatear hora de TimeField (HH:MM:SS o HH:MM) a formato 12h
                                                                        const formatearHora = (horaStr) => {
                                                                            if (!horaStr) return 'N/A';
                                                                            const partes = horaStr.split(':');
                                                                            let hora = parseInt(partes[0], 10);
                                                                            const minutos = partes[1] || '00';
                                                                            const ampm = hora >= 12 ? 'PM' : 'AM';
                                                                            hora = hora % 12 || 12;
                                                                            return `${hora}:${minutos} ${ampm}`;
                                                                        };
                                                                        const horaInicio = formatearHora(evento.hora_inicio);
                                                                        const horaFin = formatearHora(evento.hora_fin);
                                                                        return `${horaInicio} - ${horaFin}`;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                                                <span className="line-clamp-1">{evento.ubicacion_nombre || 'Ubicación por confirmar'}</span>
                                                            </div>
                                                            {/* Días de la semana */}
                                                            {evento.dias_semana && (
                                                                <div className="flex items-start gap-2 text-foreground mt-1">
                                                                    <CalendarDays className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                                                    <span className="line-clamp-2 capitalize leading-tight whitespace-normal break-words">
                                                                        {(() => {
                                                                            let dias = evento.dias_semana;
                                                                            if (typeof dias === 'string') {
                                                                                // Intentar limpiar si viene como string JSON "['Lunes']"
                                                                                // Si tiene comillas dobles, puede ser JSON valido.
                                                                                // Si tiene simples, reemplazar.
                                                                                try {
                                                                                     // Intentar parseo directo o con reemplazo
                                                                                     let clean = dias.replace(/'/g, '"');
                                                                                     if (clean.startsWith('[')) {
                                                                                         dias = JSON.parse(clean);
                                                                                     }
                                                                                } catch (e) {
                                                                                    // Fallback: regex basico para limpiar [ ] " '
                                                                                    dias = dias.replace(/[\[\]"']/g, '');
                                                                                }
                                                                            }
                                                                            return Array.isArray(dias) ? dias.join(', ') : dias;
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Botón - Solo para eventos futuros (no pasados ni en curso) */}
                                                    {isAuthenticated && !esPasado && !esEnCurso && (
                                                        <Button
                                                            onClick={() => handleInscribirse(evento.id, evento.nombre)}
                                                            size="sm"
                                                            className="w-full mt-auto bg-primary hover:bg-primary/90 text-white font-semibold shadow-md transition-all hover:translate-y-[-2px]"
                                                        >
                                                            Inscribirse
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            )})} 
                        </CarouselContent>
                        <CarouselPrevious className="-left-4 md:-left-12 bg-white/10 hover:bg-white/20 border-0 backdrop-blur-md" />
                        <CarouselNext className="-right-4 md:-right-12 bg-white/10 hover:bg-white/20 border-0 backdrop-blur-md" />
                    </Carousel>
                ) : (
                    <p>No hay eventos próximos disponibles.</p>
                )}
            </div>
        </section>
    );
}

export default CaruselEvent;