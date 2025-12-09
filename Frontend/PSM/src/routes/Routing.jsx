import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Calendario from '../pages/Calendario'
import Contacto from '../pages/Contacto'
import Sesion from '../pages/Sesion'
import Admin from '../pages/Admin'
import { AdminRoute } from './PrivateRoute'
import Preguntas from '../pages/Preguntas'
import PerfilUsuario from '../pages/PerfilUsuario'

function Routing() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Navigate to='/home'/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/calendario' element={<Calendario/>}/>
          <Route path='/eventos' element={<Calendario/>}/>
          <Route path='/eventos/proximos' element={<Calendario/>}/>
          <Route path='/eventos/pasados' element={<Calendario/>}/>
          <Route path='/contacto' element={<Contacto/>}/>
          <Route path='/sesion' element={<Sesion/>}/>
          <Route path='/preguntas' element={<Preguntas/>}/>
          <Route path='/perfil' element={<PerfilUsuario/>}/>
          <Route path='/admin/*' element={ 
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default Routing