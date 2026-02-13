#!/bin/bash
# Script de inicio para Railway

set -e

echo "🚀 Iniciando PSM Backend..."

# Verificar variables obligatorias
if [ -z "$SECRET_KEY" ]; then
    echo "❌ Error: SECRET_KEY no está configurado"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurado. Agrega PostgreSQL en Railway."
    exit 1
fi

echo "✓ Variables de entorno verificadas"

# Crear migraciones (primera vez en Railway)
echo "📦 Creando migraciones..."
python manage.py makemigrations --noinput

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
python manage.py migrate --noinput

# Crear superusuario automáticamente si no existe
echo "👤 Verificando superusuario..."
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

# Crear superusuario con credenciales del entorno o valores por defecto
username = 'admin'
email = 'admin@psm.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'✅ Superusuario creado:')
    print(f'   Username: {username}')
    print(f'   Email: {email}')
    print(f'   Password: {password}')
    print('')
    print('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login!')
else:
    print('✓ Superusuario ya existe')
EOF

echo "✅ Configuración completada"

# Iniciar servidor Gunicorn
echo "🌐 Iniciando servidor en puerto $PORT..."
exec gunicorn PSM.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 60
