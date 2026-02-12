import React from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Contactar from '../components/Contactar/Contactar'
import CaruselEvent from '../components/CarruselEvent/CaruselEvent'
import CategoriasPopulares from '../components/CategoriasPopulares/CategoriasPopulares'

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