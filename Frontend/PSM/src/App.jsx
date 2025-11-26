import Routing from './routes/Routing.jsx'
import { Toaster } from "@/components/ui/toaster"

function App() {

  return (
    <>
      <div>
        <Routing/>
        <Toaster/> {/* Notificaciones para el uso del componente Toast */}
      </div>
    </>
  )
}

export default App