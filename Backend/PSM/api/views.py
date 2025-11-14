from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *

# vistas usuario
class UsuarioListCreateView(ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


# Vistas CategEvento 
class CategEventoListCreateView(ListCreateAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer

class CategEventoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer


# Vistas Ubicacion
class UbicacionListCreateView(ListCreateAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer

class UbicacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer


# Vistas de Evento
class EventoListCreateView(ListCreateAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class EventoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer


# vistas de inscripcion
class InscripcionListCreateView(ListCreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer

class InscripcionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer


# vista de reseña
class ResenaListCreateView(ListCreateAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer

class ResenaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer


class ContactoView(APIView):
    def post(self, request):
        serializer = ContactoSerializer(data=request.data)
        if serializer.is_valid():
            # Aca proceso el mensaje (email o notificacion)
            return Response({"message": "Mensaje recibido"})
        return Response(serializer.errors, status=400)