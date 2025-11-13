import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2 className="logo-text">Puntarenas Se Mueve</h2>
        </div>

        <div className="footer-columnas">
          <div className="columna">
            <h3 className="titulo-columna">Eventos</h3>
            <ul className="lista-footer">
              <li><Link to="/eventos">Todos</Link></li>
              <li><Link to="/eventos/proximos">Proximos</Link></li>
              <li><Link to="/eventos/pasados">Pasados</Link></li>
            </ul>
          </div>

          <div className="columna">
            <h3 className="titulo-columna">Soporte</h3>
            <ul className="lista-footer">
              <li><Link to="/contacto">Contacto</Link></li>
              <li><Link to="/ayuda">Ayuda</Link></li>
              <li><Link to="/faq">Preguntas</Link></li>
            </ul>
          </div>

          <div className="columna">
            <h3 className="titulo-columna">Cuenta</h3>
            <ul className="lista-footer">
              <li><Link to="/login">Ingresar</Link></li>
              <li><Link to="/registro">Registro</Link></li>
              <li><Link to="/terminos">Terminos</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;