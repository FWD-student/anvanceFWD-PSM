import React from 'react'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import Contactar from '../components/Contactar/Contactar.jsx'
import CaruselEvent from '../components/CarruselEvent/CaruselEvent.jsx'

function Home() {
  return (
    <div>
        <Header/>
        <CaruselEvent/>
        <Contactar/>
        <Footer/>
    </div>
  )
}

export default Home;