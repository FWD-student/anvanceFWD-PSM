#!/bin/bash
# Script de inicio para Railway

set -e

echo "=========================================="
echo "Iniciando PSM Backend..."
echo "=========================================="

# Verificar variables obligatorias
if [ -z "$SECRET_KEY" ]; then
    echo "Error: SECRET_KEY no esta configurado"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL no esta configurado. Agrega PostgreSQL en Railway."
    exit 1
fi

echo "✓ Variables de entorno verificadas"
echo "✓ DATABASE_URL configurada"

# Verificar conexion a base de datos
echo ""
echo "Verificando conexion a PostgreSQL..."
python manage.py dbshell --command="SELECT 1;" 2>/dev/null && echo "✓ Conexion exitosa" || echo "⚠ No se pudo verificar conexion (continuando...)"

# Crear migraciones (primera vez en Railway)
echo ""
echo "Paso 1: Creando migraciones..."
python manage.py makemigrations api --noinput || echo "⚠ Advertencia: makemigrations tuvo problemas pero continuamos"

# Ejecutar migraciones
echo ""
echo "Paso 2: Ejecutando migraciones..."
python manage.py migrate --noinput || {
    echo "Error: Las migraciones fallaron"
    echo "Esto puede ser porque no existen migraciones iniciales"
    echo "Intentando crear migraciones de nuevo..."
    python manage.py makemigrations api auth admin sessions contenttypes --noinput
    python manage.py migrate --noinput
}

echo "✓ Migraciones completadas"

# Crear superusuario automáticamente si no existe
echo ""
echo "Paso 3: Verificando superusuario..."
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

# Crear superusuario con credenciales del entorno o valores por defecto
username = 'admin'
email = 'admin@psm.com'
password = 'admin123'

try:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superusuario creado:')
        print(f'  Username: {username}')
        print(f'  Email: {email}')
        print(f'  Password: {password}')
        print('')
        print('IMPORTANTE: Cambia la contrasena despues del primer login!')
    else:
        print('Superusuario ya existe')
except Exception as e:
    print(f'Error creando superusuario: {e}')
EOF

echo ""
echo "=========================================="
echo "Configuracion completada exitosamente!"
echo "=========================================="
echo ""

# Iniciar servidor Gunicorn
echo "Iniciando servidor Gunicorn en puerto $PORT..."
exec gunicorn PSM.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 60 --access-logfile - --error-logfile -
