import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Home from '../pages/Home'

function Routing() {
  return (
    <div>
        <Router>
            <Routes>
               <Route path='/' element={<Navigate to='/home' />}/>
                <Route path='/home' element={<Home/>}/>
                <Route></Route>
                <Route></Route>
            </Routes>
        </Router>
    </div>
  )
}

export default Routing