# Refactorización del Header

Este componente ha sido actualizado para utilizar **shadcn/ui** y **Tailwind CSS**, mejorando la estética y la funcionalidad responsive.

## Cambios Principales

### 1. Navegación de Escritorio (`NavigationMenu`)
- Se reemplazó la lista `<ul>` básica por el componente `NavigationMenu` de shadcn/ui.
- Ofrece animaciones suaves y un diseño más profesional.
- **Dependencia**: `@radix-ui/react-navigation-menu`.

### 2. Navegación Móvil (`Sheet`)
- Se eliminó el menú desplegable manual (`useState`).
- Se implementó un componente `Sheet` (Sidebar) que se desliza desde la derecha.
- Se activa mediante un botón "hamburguesa" visible solo en pantallas pequeñas (`md:hidden`).
- **Dependencia**: `@radix-ui/react-dialog`.

### 3. Estilos
- Se eliminó el archivo `header.css`.
- Todo el estilizado se realiza ahora con clases de utilidad de **Tailwind CSS** (ej. `sticky`, `backdrop-blur`, `flex`, `hidden md:flex`).

## Estructura de Archivos
- `Header.jsx`: Componente principal.
- `../ui/navigation-menu.jsx`: Componente base de UI para el menú.
- `../ui/sheet.jsx`: Componente base de UI para el sidebar móvil.