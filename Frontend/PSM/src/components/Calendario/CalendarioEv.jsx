import React, { useState } from "react";
import { Calendar } from "react-big-calendar";
import localizer from "../../utils/calendarlocalizer.js";
import "react-big-calendar/lib/css/react-big-calendar.css";


//testeo
const eventosIniciales = [
  {
    title: "Reunion del equipo",
    start: new Date(2025, 10, 13, 10, 0),
    end: new Date(2025, 10, 13, 11, 0),
  },
  {
    title: "Taller comunitario",
    start: new Date(2025, 10, 15, 9, 0),
    end: new Date(2025, 10, 15, 12, 0),
  },
]

 function CalendarioEv() {
  const [eventos, setEventos] = useState(eventosIniciales);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={["month", "week", "day"]}
        defaultView="month"
        popup
      />
    </div>
  )
}

export default CalendarioEv;