import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import { Calendar, Views } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendarioEv.css";
import EventoService from "../../services/eventoService";
import categoriaService from "../../services/categoriaService";
import ubicacionService from "../../services/ubicacionService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

// Paleta de colores para categorias de deportes
const COLORES_CATEGORIAS = {
  1: { bg: '#22c55e', border: '#16a34a' },  // Futbol
  3: { bg: '#3b82f6', border: '#2563eb' },  // Baloncesto
  2: { bg: '#f59e0b', border: '#d97706' },  // Natacion
  4: { bg: '#ef4444', border: '#dc2626' },  // Voleibol
  5: { bg: '#8b5cf6', border: '#7c3aed' },  // Atletismo
  6: { bg: '#ec4899', border: '#db2777' },  // Zumba
  7: { bg: '#06b6d4', border: '#0891b2' },  // Ciclismo
  8: { bg: '#84cc16', border: '#65a30d' },  // Tenis
  9: { bg: '#f97316', border: '#ea580c' },  // Naranja oscuro
  10: { bg: '#14b8a6', border: '#0d9488' }, // Teal
};

// Color por defecto si la categoria no esta en la paleta
const COLOR_DEFAULT = { bg: '#6b7280', border: '#4b5563' };

// Dias de la semana para mapeo
const DIAS_MAP = {
  'lunes': 1,
  'martes': 2,
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6,
  'domingo': 0
};

// Funcion para parsear hora en formato HH:MM:SS o HH:MM
const parsearHora = (horaStr) => {
  if (!horaStr) return { hora: 8, min: 0 };
  
  const partes = horaStr.split(':');
  return {
    hora: parseInt(partes[0]) || 8,
    min: parseInt(partes[1]) || 0
  };
};

function CalendarioEv() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  const [rawData, setRawData] = useState({ events: [], cats: [], locs: [] });
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();

  // 1. Cargar datos 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosData, categoriasData, ubicacionesData] = await Promise.all([
          EventoService.getEventos(true),
          categoriaService.getCategEventos(),
          ubicacionService.getUbicaciones()
        ]);
        setRawData({ events: eventosData, cats: categoriasData, locs: ubicacionesData });
        setCategorias(categoriasData);
        setUbicaciones(ubicacionesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Procesar
  useEffect(() => {
      if (loading) return;
      const { events, cats, locs } = rawData;
      
      const catsMap = cats.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      const locsMap = locs.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

      const now = new Date();
      now.setHours(0,0,0,0);

      let filtered = events;
      if (location.pathname.includes('/eventos/proximos')) {
          filtered = events.filter(e => new Date(e.fecha_fin + 'T00:00:00') >= now);
      } else if (location.pathname.includes('/eventos/pasados')) {
          filtered = events.filter(e => new Date(e.fecha_fin + 'T00:00:00') < now);
      }

      const formatted = [];
      
      filtered.forEach(evento => {
        const { hora: hI, min: mI } = parsearHora(evento.hora_inicio);
        const { hora: hF, min: mF } = parsearHora(evento.hora_fin);
        
        const resource = {
            ...evento,
            categoria_info: catsMap[evento.categoria],
            ubicacion_info: locsMap[evento.ubicacion]
        };

        let dias = evento.dias_semana;
        if (typeof dias === 'string') try { dias = JSON.parse(dias); } catch { dias = []; }
        if (!Array.isArray(dias)) dias = [];

        const startBase = new Date(evento.fecha_inicio + 'T00:00:00');
        const endBase = new Date(evento.fecha_fin + 'T00:00:00');

        if (dias.length === 0) {
            const s = new Date(startBase); s.setHours(hI, mI, 0, 0);
            const e = new Date(endBase); e.setHours(hF, mF, 0, 0);
            formatted.push({ title: evento.nombre, start: s, end: e, allDay: false, resource });
        } else {
            for (let d = new Date(startBase); d <= endBase; d.setDate(d.getDate() + 1)) {
                if (dias.some(dia => DIAS_MAP[dia] === d.getDay())) {
                     const s = new Date(d); s.setHours(hI, mI, 0, 0);
                     const e = new Date(d); e.setHours(hF, mF, 0, 0);
                     formatted.push({ title: evento.nombre, start: s, end: e, allDay: false, resource });
                }
            }
        }
      });
      setEventos(formatted);
  }, [rawData, loading, location.pathname]);

  const eventPropGetter = (event) => {
    const categoriaId = event.resource?.categoria;
    const colores = COLORES_CATEGORIAS[categoriaId] || COLOR_DEFAULT;
    return {
      style: {
        backgroundColor: colores.bg,
        borderColor: colores.border,
        borderLeft: `4px solid ${colores.border}`,
        color: '#ffffff',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500'
      }
    };
  };

  const EventComponent = ({ event }) => {
    const imageUrl = EventoService.getEventoImagenUrl(event.resource.imagen_id);
    return (
      <div className="flex items-center gap-1 overflow-hidden">
        {imageUrl && (
            <img src={imageUrl} alt={event.title} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
        )}
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const handleSelectEvent = (event) => setSelectedEvent(event);
  const onView = useCallback((newView) => setView(newView), [setView]);
  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    const { hora, min } = parsearHora(horaStr);
    const periodo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora > 12 ? hora - 12 : (hora === 0 ? 12 : hora);
    return `${hora12}:${min.toString().padStart(2, '0')} ${periodo}`;
  };

  const formatearDias = (diasArray) => {
    let dias = diasArray;
    if (typeof dias === 'string') try { dias = JSON.parse(dias); } catch { return 'No especificado'; }
    if (!dias || !Array.isArray(dias) || dias.length === 0) return 'No especificado';
    if (dias.length === 7) return 'Todos los días';
    const map = { 'lunes': 'Lun', 'martes': 'Mar', 'miercoles': 'Mié', 'jueves': 'Jue', 'viernes': 'Vie', 'sabado': 'Sáb', 'domingo': 'Dom' };
    return dias.map(d => map[d] || d).join(', ');
  };

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        view={view}
        date={date}
        onView={onView}
        onNavigate={onNavigate}
        popup
        showMultiDayTimes
        step={30}
        timeslots={2}
        min={new Date(1970, 1, 1, 6, 0, 0)}
        max={new Date(1970, 1, 1, 22, 0, 0)}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        components={{
            event: EventComponent
        }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos en este rango.",
        }}
      />

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{selectedEvent?.title}</DialogTitle>
                <DialogDescription>
                    {selectedEvent?.start.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </DialogDescription>
            </DialogHeader>
            
            {selectedEvent?.resource.imagen_id && (
                <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden my-4">
                    <img 
                        src={EventoService.getEventoImagenUrl(selectedEvent.resource.imagen_id)} 
                        alt={selectedEvent.title}
                        className="w-full h-full object-contain"
                    />
                </div>
            )}
            
            <div className="space-y-3">
                <p className="text-sm text-gray-700">{selectedEvent?.resource.descripcion}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="font-semibold">Horario:</span>
                        <p className="text-gray-600">
                            {formatearHora(selectedEvent?.resource.hora_inicio)} - {formatearHora(selectedEvent?.resource.hora_fin)}
                        </p>
                    </div>
                    
                    <div>
                        <span className="font-semibold">Días:</span>
                        <p className="text-gray-600">{formatearDias(selectedEvent?.resource.dias_semana)}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="font-semibold">Categoría:</span>
                        <p className="text-gray-600">{selectedEvent?.resource.categoria_info?.nombre || 'Sin categoría'}</p>
                    </div>
                    
                    <div>
                        <span className="font-semibold">Ubicación:</span>
                        <p className="text-gray-600">{selectedEvent?.resource.ubicacion_info?.recinto || 'Sin ubicación'}</p>
                    </div>
                </div>
                
                {selectedEvent?.resource.ubicacion_info?.direccion && (
                    <div className="text-sm">
                        <span className="font-semibold">Ver en mapa:</span>
                        <a 
                            href={selectedEvent.resource.ubicacion_info.direccion} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-1"
                        >
                            Abrir ubicación
                        </a>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                    <div>
                        <span className="font-semibold">Cupos disponibles:</span>
                        <p className="text-gray-600">{selectedEvent?.resource.cupos_disponibles} / {selectedEvent?.resource.cupo_maximo}</p>
                    </div>
                    
                    {selectedEvent?.resource.edad_minima && (
                        <div>
                            <span className="font-semibold">Edad:</span>
                            <p className="text-gray-600">
                                {selectedEvent.resource.edad_minima} - {selectedEvent.resource.edad_maxima || '∞'} años
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarioEv;