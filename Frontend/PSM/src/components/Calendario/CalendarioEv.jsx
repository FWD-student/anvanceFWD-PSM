import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventoService from "../../services/EventoService";

function CalendarioEv() {
  const [eventos, setEventos] = useState([]);

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
        allDay: false, // Adjust based on your needs
        resource: evento
      }));

      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar eventos para el calendario:", error);
    }
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
    </div>
  );
}

export default CalendarioEv;