from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from api.models import CategEvento, Ubicacion, Evento
import os
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Sembrar datos iniciales (Roles, Superusuario, Categorias, Eventos)'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando sembrado de datos...')
        
        Usuario = get_user_model()

        try:
            # 1. Crear Grupos
            cliente_group, created = Group.objects.get_or_create(name='cliente')
            admin_group, created = Group.objects.get_or_create(name='admin')
            self.stdout.write(self.style.SUCCESS(f'Grupos creados/verificados: cliente, admin'))

            # 2. Crear Superusuario desde Variables de Entorno
            superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
            superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
            superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')

            if not Usuario.objects.filter(username=superuser_username).exists():
                user = Usuario.objects.create_superuser(
                    username=superuser_username,
                    email=superuser_email,
                    password=superuser_password,
                    first_name='Admin',
                    last_name='Sistema'
                )
                self.stdout.write(self.style.SUCCESS(f'Superusuario {superuser_username} creado'))
            else:
                self.stdout.write(self.style.WARNING(f'Superusuario {superuser_username} ya existe'))

            # 3. Crear Categorias
            categorias = [
                'Futbol', 'Baloncesto', 'Voleibol', 'Natacion', 'Atletismo', 
                'Ciclismo', 'Tenis', 'Rugby', 'Beisbol', 'Softbol', 'Zumba'
            ]
            for cat_nombre in categorias:
                CategEvento.objects.get_or_create(
                    nombre=cat_nombre, 
                    defaults={'descripcion': f'Eventos de {cat_nombre}'}
                )
            self.stdout.write(self.style.SUCCESS(f'Categorias creadas/verificadas: {len(categorias)}'))

            # 4. Crear Ubicacion de prueba
            ubicacion, created = Ubicacion.objects.get_or_create(
                recinto='Polideportivo Monserrat',
                defaults={
                    'direccion': 'https://maps.app.goo.gl/EJ5wJ5Q5Q5Q5Q5Q5', 
                    'imagen_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Polideportivo_Monserrat.jpg/1200px-Polideportivo_Monserrat.jpg'
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Ubicacion creada/verificada: {ubicacion.recinto}'))

            # 5. Crear Evento de prueba (Futuro)
            if not Evento.objects.filter(nombre='Clase de Zumba Gratis').exists():
                cat_zumba = CategEvento.objects.filter(nombre='Zumba').first()
                if not cat_zumba:
                    cat_zumba = CategEvento.objects.first()

                fecha_inicio = (datetime.now() + timedelta(days=5)).date()
                fecha_fin = (datetime.now() + timedelta(days=5)).date()

                Evento.objects.create(
                    nombre='Clase de Zumba Gratis',
                    descripcion='Clase inaugural de Zumba para toda la comunidad.',
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    hora_inicio='09:00:00',
                    hora_fin='11:00:00',
                    cupo_maximo=50,
                    cupos_disponibles=50,
                    costo=0,
                    categoria=cat_zumba,
                    ubicacion=ubicacion,
                    estado='activo',
                    dias_semana=['Sabado'],
                    edad_minima=12,
                    edad_maxima=99
                )
                self.stdout.write(self.style.SUCCESS(f'Evento de prueba creado: Clase de Zumba Gratis'))
            else:
                self.stdout.write(self.style.WARNING(f'Evento de prueba ya existe'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error sembrando datos: {str(e)}'))