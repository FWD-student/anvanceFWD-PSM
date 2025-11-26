import React from 'react'
import './MapaContact.css'

function MapaContact() {
  return (
    <div className="mapa-container">
      <h2 className="mapa-titulo">¿Dónde estamos ubicados?</h2>

      <div className="mapa-wrapper">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.7912622135327!2d-84.82854442587204!3d9.977985890126291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa02f31696732a5%3A0xca28a8ef4bcf02b4!2sComite%20Cantonal%20de%20Deportes%20y%20Recreacion!5e1!3m2!1sen!2scr!4v1763648476732!5m2!1sen!2scr"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  )
}

export default MapaContact