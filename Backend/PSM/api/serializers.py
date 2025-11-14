from .models import *
from rest_framework import serializers

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class CategEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategEvento
        fields = '__all__'

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = '__all__'

class ResenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resena
        fields = '__all__'

class ContactoSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    asunto = serializers.CharField(max_length=200, required=False, allow_blank=True)
    mensaje = serializers.CharField()

#Como lo llevo en la casa 
"""  
from .models import *
from rest_framework import serializers

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class CategEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategEvento
        fields = '__all__'

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = '__all__'

class ResenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resena
        fields = '__all__'

class ContactoSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    asunto = serializers.CharField(max_length=200, required=False, allow_blank=True)
    mensaje = serializers.CharField()



# Serialazers mejorados para la comprension
class EventoListSerializer(serializers.ModelSerializer):
    #Para la lista de eventos (optimizado, menos datos)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ubicacion_nombre = serializers.CharField(source='ubicacion.recinto', read_only=True)
    
    class Meta:
        model = Evento
        fields = [
            'id', 'nombre', 'descripcion', 'categoria_nombre', 
            'ubicacion_nombre', 'fecha_inicio', 'fecha_fin', 
            'cupos_disponibles', 'cupo_maximo', 'estado'
        ]

class EventoDetalleSerializer(serializers.ModelSerializer):
    #Para ver UN evento completo con toda la info
    categoria = CategEventoSerializer(read_only=True)
    ubicacion = UbicacionSerializer(read_only=True)
    
    class Meta:
        model = Evento
        fields = '__all__'

class InscripcionSerializer(serializers.ModelSerializer):
    evento_nombre = serializers.CharField(source='evento.nombre', read_only=True)
    evento_fecha = serializers.DateField(source='evento.fecha_inicio', read_only=True)
    
    class Meta:
        model = Inscripcion
        fields = '__all__'
        read_only_fields = ['fecha_inscripcion', 'usuario']

class ResenaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Resena
        fields = '__all__'
        read_only_fields = ['fecha_resena', 'usuario']
    
    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.nombre} {obj.usuario.apellido}" """