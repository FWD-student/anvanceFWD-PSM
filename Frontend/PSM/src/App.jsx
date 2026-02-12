import Routing from './routes/Routing'
import { Toaster } from "@/components/ui/toaster"
import { ProveedorTema } from "./components/ui/proveedor-tema"

function App() {

  return (
    <>
      <ProveedorTema temaPorDefecto="sistema" claveAlmacenamiento="tema-ui-psm">
        <div>
          <Routing/>
          <Toaster/> {/* Notificaciones para el uso del componente Toast */}
        </div>
      </ProveedorTema>
    </>
  )
}

export default App