import React, { useState } from 'react';
import contactoService from '../../services/contactoService';
import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx"

//CONEXION CON LA LIBRERIA
//https://ui.shadcn.com/docs/components/carousel

function Contactar() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !correo || !mensaje) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    setEnviando(true);
    
    try {
      const response = await contactoService.createContacto(nombre, correo, telefono, mensaje);
      console.log("Contacto creado:", response);
      alert("Mensaje enviado con exito!");
      // Limpiar formulario
      setNombre("");
      setCorreo("");
      setTelefono("");
      setMensaje("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Hubo un error al enviar el mensaje. Por favor intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Contáctanos</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tu número de teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="correo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="nombre@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mensaje" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Escribe tu mensaje aquí..."
                rows="5"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Contactar;