import React, { createContext, useContext, useEffect, useState } from "react"

//seccion de configuracion del tema - ahora con soporte para paletas de colores

const EstadoInicial = {
  tema: "sistema",
  setTema: () => null,
  paleta: "minimal",
  setPaleta: () => null,
  esAdmin: false,
}

const TemaContexto = createContext(EstadoInicial)

// Lista de paletas disponibles
export const PALETAS = [
  { id: 'minimal', nombre: 'Minimal', color: '#64748b', descripcion: 'Limpio y neutro' },
  { id: 'sol', nombre: 'Sol Tropical', color: '#F25C05', descripcion: 'Cálido y energético' },
  { id: 'mar', nombre: 'Mar Pacífico', color: '#3B82F6', descripcion: 'Fresco y calmante' },
  { id: 'atardecer', nombre: 'Atardecer', color: '#E31C23', descripcion: 'Vibrante y festivo' },
]

export function ProveedorTema({
  children,
  claveAlmacenamiento = "tema-ui-psm",
  clavePaleta = "paleta-ui-psm",
  temaPorDefecto = "sistema",
  paletaPorDefecto = "minimal",
  ...props
}) {
  const [tema, setTema] = useState(
    () => localStorage.getItem(claveAlmacenamiento) || temaPorDefecto
  )
  const [paleta, setPaleta] = useState(
    () => localStorage.getItem(clavePaleta) || paletaPorDefecto
  )
  const [esAdmin, setEsAdmin] = useState(false)

  // Detectar si el usuario es admin por su rol
  useEffect(() => {
    const checkAdminRole = () => {
      const userRole = localStorage.getItem('userRole')
      const isAdmin = userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'administrador')
      setEsAdmin(isAdmin)
      
      // Si es admin, forzar paleta minimal inmediatamente
      if (isAdmin && paleta !== 'minimal') {
        setPaleta('minimal')
        localStorage.setItem(clavePaleta, 'minimal')
      }
    }
    
    checkAdminRole()
    
    // Escuchar cambios en localStorage (desde otras pestañas)
    window.addEventListener('storage', checkAdminRole)
    
    // Escuchar evento personalizado para cambios de auth en la misma pestaña
    window.addEventListener('auth-change', checkAdminRole)
    
    return () => {
      window.removeEventListener('storage', checkAdminRole)
      window.removeEventListener('auth-change', checkAdminRole)
    }
  }, [paleta, clavePaleta])

  useEffect(() => {
    const root = window.document.documentElement

    // Remover clases de tema claro/oscuro
    root.classList.remove("light", "dark")

    // Determinar tema actual
    let temaActual = tema
    if (tema === "sistema") {
      const sistemaPrefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)")
      temaActual = sistemaPrefiereOscuro.matches ? "dark" : "light"
    }
    root.classList.add(temaActual)

    // Remover clases de paletas anteriores
    PALETAS.forEach(p => root.classList.remove(`tema-${p.id}`))
    
    // Si estamos en admin, forzar minimal. Si no, usar paleta seleccionada
    const paletaActiva = esAdmin ? 'minimal' : paleta
    root.classList.add(`tema-${paletaActiva}`)

  }, [tema, paleta, esAdmin])

  const valor = {
    tema,
    setTema: (nuevoTema) => {
      localStorage.setItem(claveAlmacenamiento, nuevoTema)
      setTema(nuevoTema)
    },
    paleta,
    setPaleta: (nuevaPaleta) => {
      localStorage.setItem(clavePaleta, nuevaPaleta)
      setPaleta(nuevaPaleta)
    },
    esAdmin,
  }

  return (
    <TemaContexto.Provider value={valor} {...props}>
      {children}
    </TemaContexto.Provider>
  )
}

export const useTema = () => {
  const contexto = useContext(TemaContexto)

  if (contexto === undefined) {
    throw new Error("useTema debe usarse dentro de un ProveedorTema")
  }

  return contexto
}