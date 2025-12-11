import { useState, useEffect } from 'react';

export function useModoRendimiento() {
  const [esGamaBaja, setEsGamaBaja] = useState(false);
  const [animacionesHabilitadas, setAnimacionesHabilitadas] = useState(true);

  useEffect(() => {
    // 1. Detectar preferencia de movimiento reducido del usuario (Accesibilidad)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAnimacionesHabilitadas(!mediaQuery.matches);

    const handleMotionChange = (e) => setAnimacionesHabilitadas(!e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // 2. Detectar hardware (Concurrencia de CPU) para estimar potencia
    // Si tiene menos de 4 núcleos lógicos, asumimos que es un dispositivo de gama baja/antiguo
    // y desactivamos efectos pesados como blur o expansiones constantes.
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      setEsGamaBaja(true);
    }
    
    // Opcional: Podríamos usar navigator.deviceMemory si estuviéramos en Chrome puro/HTTPS,
    // pero hardwareConcurrency tiene mejor soporte cross-browser básico.

    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  return { esGamaBaja, animacionesHabilitadas };
}