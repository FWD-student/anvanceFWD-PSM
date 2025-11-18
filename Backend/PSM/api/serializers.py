from .models import *
from rest_framework import serializers
# from django.contrib.auth.models import User # importante para usar la tabla de Django, pero con el abstract ya no es necesario
from django.contrib.auth.hashers import make_password # importante para encriptar la contraseña  
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # Serializer para el token con informacion del rol

Usuario = get_user_model() 
userGroup = Usuario.groups.through # habilito la tabla por defecto de django para la asignacion de de roles

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'telefono',          # campo necesario (nuevo)
            'edad',              # campo necesario (nuevo)
            'fecha_nacimiento',  # campo nuevo
            'password',
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return Usuario.objects.create(**validated_data)

    # validacion a futuro
    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya esta registrado")
        return value
    

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

class ContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacto
        fields = '__all__'

# Serializer para asignar grupos (roles) a usuarios
class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = userGroup
        fields = '__all__'
    
    def validate(self, data):
        if userGroup.objects.filter(user_id=data['user'], group_id=data['group']).exists():
            raise serializers.ValidationError("Este usuario ya tiene ese rol asignado.")
        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Obtengo el grupo o rol del usuario
        groups = self.user.groups.values_list('name', flat=True)
        
        # Agregar informacion adicional al token
        data['role'] = groups[0] if groups else None
        data['id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        
        return data