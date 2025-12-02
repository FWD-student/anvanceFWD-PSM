import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventoService from "../../services/eventoService";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

function CalendarioEv() {
  const [eventos, setEventos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      // Fetch events using the service (now supports public access)
      const data = await EventoService.getEventos(true); // Use cache busting to get fresh data

      // Map backend data to calendar format
      const eventosFormateados = data.map(evento => ({
        title: evento.nombre,
        start: new Date(evento.fecha_inicio),
        end: new Date(evento.fecha_fin),
        allDay: false, 
        resource: evento
      }));

      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar eventos para el calendario:", error);
    }
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
        views={["month", "week", "day"]}
        defaultView="month"
        popup
        onSelectEvent={handleSelectEvent}
        components={{
            event: EventComponent
        }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
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
                {selectedEvent?.resource.ubicacion && (
                    <p className="text-sm font-semibold">Ubicación ID: <span className="font-normal">{selectedEvent.resource.ubicacion}</span></p>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarioEv;