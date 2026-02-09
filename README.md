# PSM - Sistema de Gestión de Eventos

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com/)
[![n8n](https://img.shields.io/badge/n8n-Automation-FF6D5A?logo=n8n)](https://n8n.io/)

</div>

## Descripción

PSM es una plataforma full-stack para la gestión integral de eventos. Permite a usuarios descubrir, registrarse y gestionar eventos, mientras que los administradores pueden crear eventos, gestionar usuarios y acceder a estadísticas detalladas.

## Características Principales

### Gestión de Usuarios
- **Autenticación JWT** con tokens de acceso y refresh
- **Verificación de email** mediante Brevo (Sendinblue)
- **Validación de identidad** mediante web scraping del TSE
- **Roles diferenciados**: Usuario regular, Usuario invitado y Administrador
- **Peril de usuario** con historial de eventos inscritos

### Gestión de Eventos
- **Calendario interactivo** para visualización de eventos
- **Eventos públicos y privados** con control de permisos
- **Sistema de inscripciones** con gestión de cupos
- **Reseñas y valoraciones** de eventos pasados
- **Carrusel de eventos** destacados en el home

### Panel de Administración
- **Dashboard con estadísticas** en tiempo tiempo
- **Gestión de usuarios** con permisos granular
- **Gestión de categorías** y ubicaciones
- **Control de eventos pendientes** de aprobación

### Automatización (n8n)
- **Notificaciones automáticas** por email a usuarios inscritos
- **Recordatorios programados** con anticipación configurable
- **Notificaciones WhatsApp** para administradores
- **API segura** con autenticación por API Key para integraciones

### UI/UX
- **Modo oscuro/claro** con selección automática del sistema
- **Animaciones fluidas** con Framer Motion
- **Paleta de colores personalizable**
- **Diseño responsive** con Tailwind CSS
- **Componentes accesibles** con Radix UI

## Stack Tecnológico

### Frontend
- **React 19** - Biblioteca UI
- **Vite 7** - Build tool y dev server
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Componentes primitivos accesibles
- **Framer Motion** - Animaciones
- **React Router DOM** - Enrutamiento
- **Recharts** - Gráficos y estadísticas
- **React Big Calendar** - Calendario de eventos
- **Lucide React** - Iconos

### Backend
- **Django 5.1** - Framework web Python
- **Django REST Framework** - API REST
- **SimpleJWT** - Autenticación JWT
- **MySQL** - Base de datos relacional
- **MongoDB** - Almacenamiento de media
- **Brevo (Sendinblue)** - Envío de emails
- **python-dotenv** - Gestión de variables de entorno

### Automatización
- **n8n** - Plataforma de automatización workflow
- **Webhooks** - Integración con el backend
- **API Key** - Autenticación segura

## Requisitos Previos

- Node.js 18+
- Python 3.12+
- MySQL 8.0+
- MongoDB 7.0+
- n8n (para automatizaciones)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/FWD-student/anvanceFWD-PSM.git
cd anvanceFWD-PSM
```

### 2. Configurar Backend (Django)

```bash
cd Backend/PSM

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install django djangorestframework djangorestframework-simplejwt mysqlclient pymongo django-cors-headers python-dotenv requests beautifulsoup4

# Configurar variables de entorno (crear archivo .env)
echo "N8N_API_KEY=tu-api-key-segura" > .env
echo "ADMIN_WHATSAPP=tu-numero-admin" >> .env

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### 3. Configurar Frontend (React)

```bash
cd Frontend/PSM

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Configurar n8n (Opcional pero recomendado)

```bash
# Instalar n8n globalmente
npm install -g n8n

# Iniciar n8n
n8n
```

Accede a `http://localhost:5678` y configura los workflows de automatización importando los flujos del proyecto.

## Estructura del Proyecto

```
anvanceFWD-PSM/
├── Frontend/
│   └── PSM/
│       ├── src/
│       │   ├── components/     # Componentes reutilizables
│       │   ├── pages/          # Páginas de la aplicación
│       │   ├── services/       # Llamadas a API
│       │   ├── hooks/          # Custom hooks
│       │   └── utils/          # Utilidades
│       └── package.json
│
├── Backend/
│   └── PSM/
│       ├── api/
│       │   ├── models.py       # Modelos de datos
│       │   ├── views.py        # Vistas de API
│       │   ├── serializers.py  # Serializadores
│       │   └── urls.py         # Rutas de API
│       ├── PSM/
│       │   └── settings.py     # Configuración Django
│       └── manage.py
│
└── README.md
```

## Uso

### Acceso a la aplicación

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/`
- **Panel Admin Django**: `http://localhost:8000/admin/`

### Flujo típico

1. **Registro**: Los usuarios se registran con validación del TSE
2. **Verificación**: Email de verificación enviado automáticamente
3. **Explorar**: Navegación de eventos disponibles en el calendario
4. **Inscripción**: Registro en eventos con confirmación
5. **Notificaciones**: Recordatorios automáticos antes del evento

### Roles de Usuario

- **Usuario Regular**: Puede ver eventos, inscribirse y dejar reseñas
- **Usuario Invitado**: Acceso limitado a funcionalidades
- **Administrador**: Gestión completa de eventos, usuarios y estadísticas

## API Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/token/` | Obtener token JWT |
| POST | `/api/token/refresh/` | Refrescar token |
| GET | `/api/eventos/` | Listar eventos |
| POST | `/api/eventos/` | Crear evento (admin) |
| GET | `/api/usuarios/` | Listar usuarios (admin) |
| POST | `/api/inscripciones/` | Inscribirse a evento |
| GET | `/api/estadisticas/` | Estadísticas del sistema |

## Variables de Entorno

### Backend (.env)

```env
# Seguridad
N8N_API_KEY=psm-n8n-secret-key-2025

# WhatsApp Admin
ADMIN_WHATSAPP=63480444

# Base de datos MySQL
DB_NAME=psm
DB_USER=root
DB_PASSWORD=FWD2025l
DB_HOST=127.0.0.1
DB_PORT=3306

# MongoDB
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=psm_media
```

## Buenas Prácticas Implementadas

### Git
- Commits descriptivos y atómicos
- Ramas separadas para features
- Historial limpio y comprensible

### Seguridad
- Autenticación JWT con expiración
- Tokens refresh con rotación
- Blacklist de tokens revocados
- CORS configurado apropiadamente
- API Keys para servicios externos
- Validación de datos en backend

### Código
- Componentes modulares y reutilizables
- Separación de responsabilidades (MVC)
- Servicios desacoplados para API calls
- Validación de datos con serializers
- Manejo de errores consistente

### UI/UX
- Diseño responsive mobile-first
- Feedback visual con toast notifications
- Loading states en operaciones asíncronas
- Temas accesibles (oscuro/claro)
- Animaciones sutiles para mejor UX

## Licencia

Este proyecto fue desarrollado con fines educativos como parte del programa FWD (Forward).

## Autor

**Luis Blandon** - [@Glumie](https://github.com/Glumie)