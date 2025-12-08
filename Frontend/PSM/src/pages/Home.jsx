import React from 'react'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import Contactar from '../components/Contactar/Contactar.jsx'
import CaruselEvent from '../components/CarruselEvent/CaruselEvent.jsx'
import CategoriasPopulares from '../components/CategoriasPopulares/CategoriasPopulares.jsx'

function Home() {
  return (
    <div>
        <Header/>
        <CaruselEvent/>
        <CategoriasPopulares/>
        <Contactar/>
        <Footer/>
    </div>
  )
}

export default Home;