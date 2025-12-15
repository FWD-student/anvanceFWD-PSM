import React from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useTema, PALETAS } from "./proveedor-tema"

// Selector de paletas de colores
export function SelectorPaleta() {
  const { paleta, setPaleta, esAdmin } = useTema()
  
  // No mostrar selector en páginas de admin
  if (esAdmin) return null
  
  // Obtener el color de la paleta actual para el botón
  const paletaActual = PALETAS.find(p => p.id === paleta) || PALETAS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <div 
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: paletaActual.color }}
          />
          <span className="sr-only">Cambiar paleta de colores</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Paleta de colores</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PALETAS.map((p) => (
          <DropdownMenuItem 
            key={p.id}
            onClick={() => setPaleta(p.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div 
              className="h-4 w-4 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">{p.descripcion}</p>
            </div>
            {paleta === p.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}