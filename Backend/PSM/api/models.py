from django.db import models

# Create your models here.

# tabla para usuario
""" class Usuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="perfil")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    edad = models.IntegerField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"
 """

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
    horario = models.CharField(max_length=100, blank=False, null=False)
    cupo_maximo = models.IntegerField(blank=False, null=False)
    cupos_disponibles = models.IntegerField(blank=False, null=False)
    edad_minima = models.IntegerField(blank=True, null=True)
    edad_maxima = models.IntegerField(blank=True, null=True)
    requisitos = models.TextField(blank=True)
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
    
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="inscripciones")
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name="inscripciones")
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    comentarios = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.usuario.nombre} - {self.evento.nombre}"


# Reseñas
class Resena(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="resenas")
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name="resenas")
    calificacion = models.IntegerField(blank=False, null=False)  # 1-5 estrellas
    comentario = models.TextField(blank=True)
    fecha_resena = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.usuario.nombre} - {self.evento.nombre} ({self.calificacion}⭐)"

# Contacto    
class Contacto(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)