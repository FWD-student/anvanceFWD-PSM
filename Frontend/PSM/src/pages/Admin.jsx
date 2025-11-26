import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../components/Administrar/Dashboard'
import UsuariosAdmin from '../components/Administrar/UsuariosAdmin'
import EventosAdmin from '../components/Administrar/EventosAdmin'
import UbicacionesAdmin from '../components/Administrar/UbicacionesAdmin'
import InscripcionesAdmin from '../components/Administrar/InscripcionesAdmin'
import ResenasAdmin from '../components/Administrar/ResenasAdmin'
import AdminLayout from '../components/Administrar/AdminLayout'

function Admin() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="eventos" element={<EventosAdmin />} />
        <Route path="ubicaciones" element={<UbicacionesAdmin />} />
        <Route path="inscripciones" element={<InscripcionesAdmin />} />
        <Route path="resenas" element={<ResenasAdmin />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default Admin