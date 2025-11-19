# Documentacion del Proyecto

## Estado Actual y Proximos Pasos

Actualmente tengo dos componentes construidos y he corregido la implementacion de react-big-calendar. En el backend me falta completar la configuracion de CORS, seguir con la asignacion de roles usando la interfaz de Django (accesible en `http://127.0.0.1:8000/admin/` en lugar de `/api`), y crear un superusuario con el comando `py manage.py createsuperuser` (la contraseña es admin123, el resto de datos esta en config-imagen).

## Dependencias Pendientes

### Para el Calendario
```bash
npm install date-fns
```

### Para Backend (CORS, JWT y Cloudinary)
```bash
pip install django-cors-headers
pip install cloudinary django-cloudinary-storage
pip install djangorestframework-simplejwt
```

---

## Migracion de Bootstrap a Tailwind CSS + shadcn/ui

### 1. Limpieza de Bootstrap
Elimine Bootstrap para evitar conflictos de estilos:
```bash
npm uninstall bootstrap react-bootstrap
```

### 2. Instalacion de Tailwind CSS
Instale Tailwind y sus dependencias:
```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/postcss
```

### 3. Utilidades para shadcn/ui
Instale las librerias necesarias para los componentes:
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### 4. Dependencias de Componentes Especificos
```bash
npm install @radix-ui/react-slot    # Para Button
npm install embla-carousel-react     # Para Carousel
```

### 5. Archivos de Configuracion

#### tailwind.config.js
Define el sistema de diseno (colores, radios, etc.) y los paths de contenido.

#### postcss.config.js
Configurado para usar el plugin de Tailwind.

#### vite.config.js
Agregue un alias para que "@" apunte a "src" (necesario para las importaciones de shadcn):
```javascript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

#### src/index.css
Elimine estilos viejos y agregue las directivas de Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
(Mas las variables CSS para tema claro/oscuro)

#### components.json
Archivo de configuracion base de shadcn/ui.

### 6. Componentes Creados Manualmente

Debido a problemas con el CLI de shadcn, cree manualmente estos archivos:

**Componentes UI** (en `src/components/ui/`):
- button.jsx
- card.jsx
- carousel.jsx

**Utilidades** (en `src/lib/`):
- utils.js

---

## Reinstalar Todo desde Cero

Despues de clonar el repositorio:
```bash
npm install
```

Esto instalara todas las dependencias del package.json.

---

## Notas Importantes

### Problema con Tailwind v4
El proyecto tenia problemas porque estaba instalado Tailwind v4, que tiene cambios fundamentales en configuracion y plugins. shadcn/ui funciona con v3 (estandar actual).

**Solucion aplicada:**
- Desinstale Tailwind v4
- Instale Tailwind CSS v3.4.17 con postcss y autoprefixer
- Ajuste postcss.config.js para usar el plugin estandar `tailwindcss` en lugar de `@tailwindcss/postcss`
- Ejecute `npm run dev` y funciono correctamente