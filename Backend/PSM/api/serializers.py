from .models import *
from rest_framework import serializers
from django.contrib.auth.models import User # importante para usar la tabla de Django
from django.contrib.auth.hashers import make_password # importante para encriptar la contraseña  

""" class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__' """

# uso de la tabla automatica de django y customizando lo necesario
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name','email','password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        usuario=User.objects.create(**validated_data)
        return usuario


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