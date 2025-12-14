import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PerfilUser from '../components/PerfilUser/PerfilUser'

function PerfilUsuario() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario es admin, redirigir al panel de administración
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole && (
      userRole.toLowerCase() === 'admin' || 
      userRole.toLowerCase() === 'administrador'
    );
    
    if (isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <PerfilUser/>
  )
}

export default PerfilUsuario