from pathlib import Path
import os
from datetime import timedelta

# Cargar variables de entorno desde .env
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# PRODUCCION: Usar variables de entorno
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-cambia-esto-en-produccion')

# PRODUCCION: DEBUG debe ser False
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# PRODUCCION: Configurar dominios específicos
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# PRODUCCION: CSRF solo para tu dominio de Netlify
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# Agregar el dominio de Railway si existe
railway_domain = os.environ.get('RAILWAY_DOMAIN')
if railway_domain:
    CSRF_TRUSTED_ORIGINS.append(f'https://{railway_domain}')

# API Key para n8n
N8N_API_KEY = os.environ.get('N8N_API_KEY')
if not N8N_API_KEY:
    raise ValueError("N8N_API_KEY debe estar configurado en las variables de entorno")

ADMIN_WHATSAPP = os.environ.get('ADMIN_WHATSAPP')

AUTH_USER_MODEL = "api.Usuario"

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # PRODUCCION: Para archivos estáticos
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# PRODUCCION: CORS restringido solo a tu frontend de Netlify
CORS_ALLOWED_ORIGINS = []
netlify_url = os.environ.get('NETLIFY_URL')
if netlify_url:
    CORS_ALLOWED_ORIGINS.append(netlify_url)

# Permitir localhost solo en desarrollo
if DEBUG:
    CORS_ALLOWED_ORIGINS.extend([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ])

# Permitir cualquier origen solo para webhooks de n8n
# Esto es necesario porque n8n hace requests desde diferentes IPs
CORS_ALLOW_ALL_ORIGINS = False  # PRODUCCION: Desactivar

ROOT_URLCONF = 'PSM.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'PSM.wsgi.application'

# PRODUCCION: Usar variables de entorno para Railway MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'psm'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# PRODUCCION: MongoDB Atlas (Railway no tiene MongoDB nativo)
MONGODB_CONFIG = {
    'uri': os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/'),
    'database': os.environ.get('MONGODB_DB', 'psm_media'),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Costa_Rica'
USE_I18N = True
USE_TZ = True

# PRODUCCION: Configuración de archivos estáticos con WhiteNoise
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# PRODUCCION: Configuraciones de seguridad adicionales
SECURE_SSL_REDIRECT = not DEBUG  # Redirigir HTTP a HTTPS
SESSION_COOKIE_SECURE = not DEBUG  # Cookies solo por HTTPS
CSRF_COOKIE_SECURE = not DEBUG  # CSRF token solo por HTTPS
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Logging en producción
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}
