import React, { Suspense, lazy } from 'react'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import { Loader2 } from 'lucide-react'

// Lazy loading de componentes pesados
const CaruselEvent = lazy(() => import('../components/CarruselEvent/CaruselEvent'))
const CategoriasPopulares = lazy(() => import('../components/CategoriasPopulares/CategoriasPopulares'))
const Contactar = lazy(() => import('../components/Contactar/Contactar'))

function Home() {
  return (
    <div>
        <Header/>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <CaruselEvent/>
          <CategoriasPopulares/>
          <Contactar/>
        </Suspense>
        <Footer/>
    </div>
  )
}

export default Home;