import React from 'react';
import Contactar from '../components/Contactar/Contactar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import MapaContact from '../components/Mapa/MapaContact';

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