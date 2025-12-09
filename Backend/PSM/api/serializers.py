from .models import *
from rest_framework import serializers
from django.contrib.auth.hashers import make_password # from django.contrib.auth.models import User # importante para usar la tabla de Django, pero con el abstract ya no es necesario
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

Usuario = get_user_model()
userGroup = Usuario.groups.through

class UserSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'telefono', #datos extra
            'edad', #datos extra
            'fecha_nacimiento', #datos extra
            'password',
            'intereses',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'intereses': {'required': False}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = Usuario.objects.create(**validated_data)
        
        try:
            group, created = Group.objects.get_or_create(name='cliente')
            user.groups.add(group)
        except Exception as e:
            print(f"Error asignando grupo: {e}")
            
        return user

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya esta registrado")
        return value

    def validate_telefono(self, value):
        import re
        # Si esta vacio, permitirlo
        if not value or value.strip() == '':
            return value
        # Si tiene valor, validar formato
        if not re.match(r'^[678]\d{7,15}$', value):
            raise serializers.ValidationError("El teléfono debe empezar con 6, 7 u 8 y tener entre 8 y 16 dígitos.")
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
        
        groups = self.user.groups.values_list('name', flat=True)
        
        data['role'] = groups[0] if groups else None
        data['id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        
        return data