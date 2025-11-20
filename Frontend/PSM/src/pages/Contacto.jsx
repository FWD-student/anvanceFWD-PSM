import React from 'react';
import Contactar from '../components/Contactar/Contactar.jsx';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import MapaContact from '../components/Mapa/MapaContact.jsx';

const Contacto = () => {
    return (
        <div>
            <Header/>
            <Contactar/>
            <MapaContact/>
            <Footer/>
        </div>
    );
}

export default Contacto;