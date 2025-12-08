import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendarioEv.css";
import EventoService from "../../services/eventoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

// Paleta de colores para categorias de deportes
const COLORES_CATEGORIAS = {
  1: { bg: '#22c55e', border: '#16a34a' },  // Futbol
  2: { bg: '#3b82f6', border: '#2563eb' },  // Natacion
  3: { bg: '#f59e0b', border: '#d97706' },  // Baloncesto
  4: { bg: '#ef4444', border: '#dc2626' },  // Atletismo
  5: { bg: '#8b5cf6', border: '#7c3aed' },  // Gimnasia
  6: { bg: '#ec4899', border: '#db2777' },  // Danza
  7: { bg: '#06b6d4', border: '#0891b2' },  // Ciclismo
  8: { bg: '#84cc16', border: '#65a30d' },  // Tenis
  9: { bg: '#f97316', border: '#ea580c' },  // Naranja oscuro
  10: { bg: '#14b8a6', border: '#0d9488' }, // Teal
};

// Color por defecto si la categoria no esta en la paleta
const COLOR_DEFAULT = { bg: '#6b7280', border: '#4b5563' };

// Funcion para parsear el horario y obtener hora de inicio
const parsearHorario = (horario) => {
  if (!horario) return { horaInicio: 8, minInicio: 0, horaFin: 9, minFin: 0 };
  
  // Intentar parsear formatos como "8:00 - 10:00", "08:00-10:00", "8:00am - 10:00am"
  const patron = /(\d{1,2}):?(\d{2})?\s*(?:am|pm)?\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(?:am|pm)?/i;
  const match = horario.match(patron);
  
  if (match) {
    return {
      horaInicio: parseInt(match[1]) || 8,
      minInicio: parseInt(match[2]) || 0,
      horaFin: parseInt(match[3]) || 9,
      minFin: parseInt(match[4]) || 0
    };
  }
  
  // Si no se puede adaptar, usar horario por defecto
  return { horaInicio: 8, minInicio: 0, horaFin: 9, minFin: 0 };
};

function CalendarioEv() {
  const [eventos, setEventos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const data = await EventoService.getEventos(true);

      // Map al backend data to calendar format con horarios parseados
      const eventosFormateados = data.map(evento => {
        const { horaInicio, minInicio, horaFin, minFin } = parsearHorario(evento.horario);
        
        // Crear fecha de inicio con hora
        const fechaInicio = new Date(evento.fecha_inicio);
        fechaInicio.setHours(horaInicio, minInicio, 0, 0);
        
        // Crear fecha de fin con hora
        const fechaFin = new Date(evento.fecha_fin);
        fechaFin.setHours(horaFin, minFin, 0, 0);
        
        return {
          title: evento.nombre,
          start: fechaInicio,
          end: fechaFin,
          allDay: false,
          resource: evento
        };
      });

      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar eventos para el calendario:", error);
    }
  };

  // Funcion para asignar colores segun la categoria del evento
  const eventPropGetter = (event) => {
    const categoriaId = event.resource?.categoria?.id || event.resource?.categoria;
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

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={["month", "week", "day", "agenda"]}
        defaultView="month"
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
                    {selectedEvent?.start.toLocaleDateString()} - {selectedEvent?.end.toLocaleDateString()}
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
            
            <div className="space-y-2">
                <p className="text-sm text-gray-700">{selectedEvent?.resource.descripcion}</p>
                {selectedEvent?.resource.horario && (
                    <p className="text-sm font-semibold">Horario: <span className="font-normal">{selectedEvent.resource.horario}</span></p>
                )}
                {selectedEvent?.resource.categoria && (
                    <p className="text-sm font-semibold">Categoria: <span className="font-normal">{selectedEvent.resource.categoria.nombre || 'Sin categoria'}</span></p>
                )}
                {selectedEvent?.resource.ubicacion && (
                    <p className="text-sm font-semibold">Ubicacion: <span className="font-normal">{selectedEvent.resource.ubicacion.recinto || selectedEvent.resource.ubicacion}</span></p>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarioEv;