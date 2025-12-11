import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 mt-16 text-sm text-muted-foreground min-w-[375px] transition-colors duration-300">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-8 lg:gap-12 justify-between items-start">
          <div className="w-full lg:flex-1 lg:min-w-[220px] text-center lg:text-left">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight leading-tight">
              Puntarenas Se Mueve
            </h2>
          </div>

          <div className="w-full lg:flex-[2] flex flex-col sm:flex-row flex-wrap gap-8 lg:gap-12 justify-center lg:justify-end">
            <div className="min-w-[160px] text-center lg:text-left">
              <h3 className="text-base font-semibold text-foreground mb-4 uppercase tracking-wide relative pb-2 after:content-[''] after:absolute after:left-1/2 lg:after:left-0 after:-translate-x-1/2 lg:after:translate-x-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-sm">
                Eventos
              </h3>
              <ul className="space-y-2.5">
                <li><Link to="/eventos" className="hover:text-primary transition-colors font-medium block py-0.5">Todos</Link></li>
                <li><Link to="/eventos/proximos" className="hover:text-primary transition-colors font-medium block py-0.5">Próximos</Link></li>
                <li><Link to="/eventos/pasados" className="hover:text-primary transition-colors font-medium block py-0.5">Pasados</Link></li>
              </ul>
            </div>

            <div className="min-w-[160px] text-center lg:text-left">
              <h3 className="text-base font-semibold text-foreground mb-4 uppercase tracking-wide relative pb-2 after:content-[''] after:absolute after:left-1/2 lg:after:left-0 after:-translate-x-1/2 lg:after:translate-x-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-sm">
                Soporte
              </h3>
              <ul className="space-y-2.5">
                <li><Link to="/contacto" className="hover:text-primary transition-colors font-medium block py-0.5">Contacto</Link></li>
                <li><Link to="/preguntas" className="hover:text-primary transition-colors font-medium block py-0.5">Preguntas</Link></li>
              </ul>
            </div>

            <div className="min-w-[160px] text-center lg:text-left">
              <h3 className="text-base font-semibold text-foreground mb-4 uppercase tracking-wide relative pb-2 after:content-[''] after:absolute after:left-1/2 lg:after:left-0 after:-translate-x-1/2 lg:after:translate-x-0 after:bottom-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-sm">
                Cuenta
              </h3>
              <ul className="space-y-2.5">
                <li><Link to="/sesion" className="hover:text-primary transition-colors font-medium block py-0.5">Ingresar</Link></li>
                <li><Link to="/sesion?view=registro" className="hover:text-primary transition-colors font-medium block py-0.5">Registro</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;