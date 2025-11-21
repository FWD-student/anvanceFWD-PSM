from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
#Rol y auth
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .permissions import IsAdminUser, IsAdminOrReadOnly
Usuario = get_user_model()


# Vistas User (autenticacion)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede ver/crear usuarios

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede ver/editar/eliminar usuarios

# Vistas CategEvento 
class CategEventoListCreateView(generics.ListCreateAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede gestionar categorías

class CategEventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede gestionar categorías


# Vistas Ubicacion
class UbicacionListCreateView(generics.ListCreateAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede gestionar ubicaciones

class UbicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede gestionar ubicaciones


# Vistas de Evento
class EventoListCreateView(generics.ListCreateAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAdminOrReadOnly]  # Lectura pública, escritura solo admin

class EventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede editar/eliminar eventos


# Vistas de inscripcion
class InscripcionListCreateView(generics.ListCreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden inscribirse

class InscripcionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados


# Vista de reseña
class ResenaListCreateView(generics.ListCreateAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Lectura pública, escritura autenticada

class ResenaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados


# Vista de Contacto
class ContactoListCreateView(generics.ListCreateAPIView):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    permission_classes = [AllowAny]  # Cualquiera puede enviar mensaje de contacto

# Las vistas para el auth y los roles

# tabla intermedia para asignar los roles
userGroup = Usuario.groups.through

# Vista para asignar roles a usuarios
class UserGroupView(generics.ListCreateAPIView):
    queryset = userGroup.objects.all()
    serializer_class = UserGroupSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede asignar roles

# Vista personalizada para el login con JWT (devuelve token y rol)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]  # Cualquiera puede hacer login

# Vista de registro (para crear usuarios sin autenticacion)
class RegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Cualquiera se puede registrar