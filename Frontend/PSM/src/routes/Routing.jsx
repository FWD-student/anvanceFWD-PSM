import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Home from '../pages/Home'
import Calendario from '../pages/Calendario'
import Contacto from '../pages/Contacto'

function Routing() {
  return (
    <div>
        <Router>
            <Routes>
               <Route path='/' element={<Navigate to='/home' />}/>
                <Route path='/home' element={<Home/>}/>
                <Route path='/calendario' element={<Calendario/>}/>
                <Route path='/contacto' element={<Contacto/>}/>
            </Routes>
        </Router>
    </div>
  )
}

export default Routing