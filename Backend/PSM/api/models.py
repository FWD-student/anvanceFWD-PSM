from django.db import models
from django.contrib.auth.models import AbstractUser #para heredar el AuthUser
from django.conf import settings  # << IMPORTANTE para relacionar el usuario

# Create your models here.

# tabla para usuario
class Usuario(AbstractUser): #una correccion con el nombramiento de 
    telefono = models.CharField(max_length=20, blank=True, null=True)
    edad = models.IntegerField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    nacionalidad = models.CharField(max_length=80, blank=True, null=True)  # Campo para TSE
    intereses = models.ManyToManyField('CategEvento', blank=True, related_name='interesados')

    def __str__(self):
        return self.username

# tabla de categoria de eventos
class CategEvento(models.Model):
    nombre = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.TextField(blank=True)
    estado = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre


# ubicaciones
class Ubicacion(models.Model):
    recinto = models.CharField(max_length=200, blank=False, null=False)
    direccion = models.URLField(max_length=500, blank=False, null=False)
    telefono_contacto = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.recinto

# Eventos (programas deportivos)
class Evento(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('finalizado', 'Finalizado'),
    ]
    
    nombre = models.CharField(max_length=200, blank=False, null=False)
    descripcion = models.TextField(blank=False)
    categoria = models.ForeignKey(CategEvento, on_delete=models.CASCADE, related_name="eventos")
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE, related_name="eventos")
    fecha_inicio = models.DateField(blank=False, null=False)
    fecha_fin = models.DateField(blank=False, null=False)
    # Dias de la semana en que se realiza el evento (array JSON: ["lunes", "martes", ...])
    dias_semana = models.JSONField(default=list, blank=True)
    # Hora de inicio y fin del evento
    hora_inicio = models.TimeField(blank=False, null=False)
    hora_fin = models.TimeField(blank=False, null=False)
    cupo_maximo = models.IntegerField(blank=False, null=False)
    cupos_disponibles = models.IntegerField(blank=False, null=False)
    edad_minima = models.IntegerField(blank=True, null=True)
    edad_maxima = models.IntegerField(blank=True, null=True)
    requisitos = models.TextField(blank=True)
    # Campo para guardar el ID de la imagen en MongoDB
    imagen_id = models.CharField(max_length=100, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    
    def __str__(self):
        return self.nombre

# Inscripciones
class Inscripcion(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inscripciones")
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name="inscripciones")
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    comentarios = models.TextField(blank=True)
    asistio = models.BooleanField(default=False) # Campo para control de asistencia
    
    def __str__(self):
        return f"{self.usuario.username} - {self.evento.nombre}"

# Reseñas
class Resena(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resenas") #correcciones si hay algun cambio con la tabla del authuser
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name="resenas")
    calificacion = models.IntegerField(blank=False, null=False)  # 1-5 estrellas
    comentario = models.TextField(blank=True)
    fecha_resena = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.usuario.username} - {self.evento.nombre} ({self.calificacion}⭐)"

# Contacto    
class Contacto(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)

# Configuracion Global del Perfil
class ConfiguracionPerfil(models.Model):
    # Singleton: solo debe haber 1 registro. Lo controlaremos en la vista.
    nombre_editable = models.BooleanField(default=True)
    apellido_editable = models.BooleanField(default=True)
    telefono_editable = models.BooleanField(default=True)
    fecha_nacimiento_editable = models.BooleanField(default=True)
    intereses_editable = models.BooleanField(default=True)
    email_editable = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # Garantizar que solo exista una instanci
        if not self.pk and ConfiguracionPerfil.objects.exists():
             raise Exception('Solo puede haber una configuración global.')
        return super(ConfiguracionPerfil, self).save(*args, **kwargs)

    def __str__(self):
        return "Configuración Global de Perfil"