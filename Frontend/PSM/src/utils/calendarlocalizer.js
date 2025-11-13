import { dateFnsLocalizer } from 'react-big-calendar' //el npm del repo de react-big-calendar del github
import { format, parse, startOfWeek, getDay } from ' date-fns' 
import es from 'date-fns/locale/es'  //Config idioma

const locales = {
    'es' : es,
}

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    format(date, formatStr, { ...options, locale: es }),
  parse: (value, formatStr, backupDate, options) =>
    parse(value, formatStr, backupDate, { ...options, locale: es }),
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // lunes
  getDay,
  locales,
});

export default localizer;