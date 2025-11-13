import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const alternarMenu = () => {
    setMostrarMenu(!mostrarMenu);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="contenedorLogo">
          <h1 className="logo-text">Puntarenas Se Mueve</h1>
        </div>

        <nav className="navBar">
          <ul className="lista">
            <li className="itemes"><Link to="/">Inicio</Link></li>
            <li className="itemes"><Link to="/calendario">Calendario</Link></li>
            <li className="itemes"><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="seccionAuth">
          <Link to="/login" className="btnLogin">
            Entrar
          </Link>
        </div>

        <button className="btnMenuMobile" onClick={alternarMenu}>
          {mostrarMenu ? '✕' : '☰'}
        </button>
      </div>

      {mostrarMenu && (
        <div className="menuMobile">
          <ul className="listaMobile">
            <li className="itemMobile"><Link to="/" onClick={alternarMenu}>Inicio</Link></li>
            <li className="itemMobile"><Link to="/calendario" onClick={alternarMenu}>Calendario</Link></li>
            <li className="itemMobile"><Link to="/contacto" onClick={alternarMenu}>Contacto</Link></li>
          </ul>
          <Link to="/login" className="btnLoginMobile" onClick={alternarMenu}>
            Entrar
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;