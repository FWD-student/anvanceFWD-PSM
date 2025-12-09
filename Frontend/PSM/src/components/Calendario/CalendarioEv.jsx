import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Views } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendarioEv.css";
import EventoService from "../../services/eventoService.jsx";
import categoriaService from "../../services/categoriaService.jsx";
import ubicacionService from "../../services/ubicacionService.jsx";
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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar eventos, categorias y ubicaciones en paralelo
      const [eventosData, categoriasData, ubicacionesData] = await Promise.all([
        EventoService.getEventos(true),
        categoriaService.getCategEventos(),
        ubicacionService.getUbicaciones()
      ]);

      setCategorias(categoriasData);
      setUbicaciones(ubicacionesData);

      // Crear mapa de categorias y ubicaciones para acceso rapido
      const categoriasMap = {};
      categoriasData.forEach(cat => { categoriasMap[cat.id] = cat; });
      
      const ubicacionesMap = {};
      ubicacionesData.forEach(ubi => { ubicacionesMap[ubi.id] = ubi; });

      // Map backend data to calendar format con horarios parseados
      const eventosFormateados = [];
      
      eventosData.forEach(evento => {
        const { hora: horaInicio, min: minInicio } = parsearHora(evento.hora_inicio);
        const { hora: horaFin, min: minFin } = parsearHora(evento.hora_fin);
        
        // Agregar informacion de categoria y ubicacion al evento
        const eventoConInfo = {
          ...evento,
          categoria_info: categoriasMap[evento.categoria] || null,
          ubicacion_info: ubicacionesMap[evento.ubicacion] || null
        };
        
        // Obtener dias del evento (puede venir como string JSON o como array)
        let diasEvento = evento.dias_semana || [];
        if (typeof diasEvento === 'string') {
          try {
            diasEvento = JSON.parse(diasEvento);
          } catch (e) {
            diasEvento = [];
          }
        }
        if (!Array.isArray(diasEvento)) {
          diasEvento = [];
        }
        
        // Si no hay dias especificos, crear evento para todo el rango de fechas
        if (diasEvento.length === 0) {
          const fechaInicio = new Date(evento.fecha_inicio + 'T00:00:00');
          fechaInicio.setHours(horaInicio, minInicio, 0, 0);
          
          const fechaFin = new Date(evento.fecha_fin + 'T00:00:00');
          fechaFin.setHours(horaFin, minFin, 0, 0);
          
          eventosFormateados.push({
            title: evento.nombre,
            start: fechaInicio,
            end: fechaFin,
            allDay: false,
            resource: eventoConInfo
          });
        } else {
          // Crear un evento por cada dia del rango que coincida con los dias seleccionados
          const fechaInicio = new Date(evento.fecha_inicio + 'T00:00:00');
          const fechaFin = new Date(evento.fecha_fin + 'T00:00:00');
          
          // Iterar por cada dia en el rango
          for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
            const diaSemana = d.getDay(); // 0 = domingo, 1 = lunes, etc.
            
            // Verificar si este dia esta en los dias del evento
            const diaCoincide = diasEvento.some(dia => DIAS_MAP[dia] === diaSemana);
            
            if (diaCoincide) {
              const eventoStart = new Date(d);
              eventoStart.setHours(horaInicio, minInicio, 0, 0);
              
              const eventoEnd = new Date(d);
              eventoEnd.setHours(horaFin, minFin, 0, 0);
              
              eventosFormateados.push({
                title: evento.nombre,
                start: eventoStart,
                end: eventoEnd,
                allDay: false,
                resource: eventoConInfo
              });
            }
          }
        }
      });

      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar eventos para el calendario:", error);
    }
  };

  // Funcion para asignar colores segun la categoria del evento
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
            <img 
                src={imageUrl} 
                alt={event.title}
                className="w-4 h-4 rounded-full object-cover flex-shrink-0"
            />
        )}
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const onView = useCallback((newView) => setView(newView), [setView]);
  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

  // Formatear hora para mostrar (HH:MM:SS -> HH:MM AM/PM)
  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    const { hora, min } = parsearHora(horaStr);
    const periodo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora > 12 ? hora - 12 : (hora === 0 ? 12 : hora);
    return `${hora12}:${min.toString().padStart(2, '0')} ${periodo}`;
  };

  // Formatear dias de la semana
  const formatearDias = (diasArray) => {
    let dias = diasArray;
    // Parsear si viene como string JSON
    if (typeof dias === 'string') {
      try {
        dias = JSON.parse(dias);
      } catch (e) {
        return 'No especificado';
      }
    }
    if (!dias || !Array.isArray(dias) || dias.length === 0) return 'No especificado';
    if (dias.length === 7) return 'Todos los días';
    
    const diasLabels = {
      'lunes': 'Lun',
      'martes': 'Mar',
      'miercoles': 'Mié',
      'jueves': 'Jue',
      'viernes': 'Vie',
      'sabado': 'Sáb',
      'domingo': 'Dom'
    };
    
    return dias.map(d => diasLabels[d] || d).join(', ');
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