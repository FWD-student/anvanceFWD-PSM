from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.contrib.auth.models import User

# Vistas Usuario
""" class UsuarioListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer """

# Vistas User (autenticacion)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Vistas CategEvento 
class CategEventoListCreateView(generics.ListCreateAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer

class CategEventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer


# Vistas Ubicacion
class UbicacionListCreateView(generics.ListCreateAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer

class UbicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer


# Vistas de Evento
class EventoListCreateView(generics.ListCreateAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class EventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer


# Vistas de inscripcion
class InscripcionListCreateView(generics.ListCreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer

class InscripcionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer


# Vista de reseña
class ResenaListCreateView(generics.ListCreateAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer

class ResenaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer


# Vista de Contacto
class ContactoListCreateView(generics.ListCreateAPIView):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer