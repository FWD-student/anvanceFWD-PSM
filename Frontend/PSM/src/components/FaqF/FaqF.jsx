import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import './faqF.css';

function FaqF() {
    const faqs = [
        {
            id: "faq-1",
            pregunta: "¿Cómo puedo inscribirme en un evento deportivo?",
            respuesta: "Para inscribirte en un evento deportivo, primero debes crear una cuenta en nuestra plataforma. Una vez registrado, navega a la sección de eventos, selecciona el evento de tu interés y haz clic en 'Inscribirse'. Recibirás una confirmación por correo electrónico."
        },
        {
            id: "faq-2",
            pregunta: "¿Cuál es la edad mínima para participar?",
            respuesta: "La edad mínima varía según el evento deportivo. Cada evento tiene especificadas las edades mínimas y máximas permitidas. Puedes ver esta información en la descripción de cada evento en la sección de detalles."
        },
        {
            id: "faq-3",
            pregunta: "¿Hay algún costo por inscribirse?",
            respuesta: "La mayoría de nuestros eventos deportivos son gratuitos, ya que son programas municipales para fomentar el deporte en la comunidad. Sin embargo, algunos eventos especiales pueden tener un costo de inscripción que se especificará claramente en la descripción del evento."
        },
        {
            id: "faq-4",
            pregunta: "¿Puedo cancelar mi inscripción?",
            respuesta: "Sí, puedes cancelar tu inscripción desde tu perfil en la sección 'Mis Inscripciones'. Te recomendamos hacerlo con al menos 48 horas de anticipación para que otra persona pueda tomar tu lugar. La cancelación liberará el cupo inmediatamente."
        },
        {
            id: "faq-5",
            pregunta: "¿Qué pasa si un evento se llena?",
            respuesta: "Cuando un evento alcanza su cupo máximo, ya no podrás inscribirte. Sin embargo, puedes estar atento a posibles cancelaciones que liberen espacios. Te recomendamos inscribirte lo antes posible para asegurar tu lugar."
        },
        {
            id: "faq-6",
            pregunta: "¿Necesito experiencia previa para participar?",
            respuesta: "No necesariamente. Muchos de nuestros eventos están diseñados para todos los niveles, desde principiantes hasta avanzados. En la descripción de cada evento encontrarás información sobre el nivel requerido o si es apto para principiantes."
        },
        {
            id: "faq-7",
            pregunta: "¿Dónde puedo ver la ubicación de los eventos?",
            respuesta: "Cada evento incluye información detallada sobre la ubicación, incluyendo el nombre del recinto deportivo y un enlace a Google Maps para que puedas encontrar el lugar fácilmente. Esta información está disponible en la página de detalles de cada evento."
        },
        {
            id: "faq-8",
            pregunta: "¿Cómo puedo contactar al organizador de un evento?",
            respuesta: "Puedes usar nuestra sección de 'Contacto' para comunicarte con nosotros. También encontrarás información de contacto específica en algunos eventos. Nuestro equipo responderá a tus consultas en un plazo de 24-48 horas."
        }
    ];

    return (
        <section className="faq-section">
            <div className="faq-container">
                <div className="faq-header">
                    <h2 className="faq-title">Preguntas Frecuentes</h2>
                    <p className="faq-subtitle">
                        Encuentra respuestas a las preguntas más comunes sobre nuestros eventos deportivos
                    </p>
                </div>

                <Accordion type="single" collapsible className="faq-accordion">
                    {faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="faq-question">
                                {faq.pregunta}
                            </AccordionTrigger>
                            <AccordionContent className="faq-answer">
                                {faq.respuesta}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

export default FaqF;