import React, { createContext, useContext, useEffect, useState } from "react"

//seccion de configuracion del tema

const EstadoInicial = {
  tema: "sistema",
  setTema: () => null,
}

const TemaContexto = createContext(EstadoInicial)

export function ProveedorTema({
  children,
  claveAlmacenamiento = "tema-ui-psm",
  temaPorDefecto = "sistema",
  ...props
}) {
  const [tema, setTema] = useState(
    () => localStorage.getItem(claveAlmacenamiento) || temaPorDefecto
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (tema === "sistema") {
      const sistemaPrefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)")
      
      root.classList.add(sistemaPrefiereOscuro.matches ? "dark" : "light")
      return
    }

    root.classList.add(tema)
  }, [tema])

  const valor = {
    tema,
    setTema: (nuevoTema) => {
      localStorage.setItem(claveAlmacenamiento, nuevoTema)
      setTema(nuevoTema)
    },
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