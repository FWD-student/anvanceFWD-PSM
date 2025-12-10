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
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsAdminOrSelf, IsOwnerOrAdmin # chequeo 
Usuario = get_user_model()
# importes necesarios para evento
from .mongo_utils import UtilidadesMongo
from django.http import HttpResponse
from django.db.models import Count


# Vistas User (autenticacion)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Solo admin puede ver/crear usuarios

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSelf]  # Admin o el propio usuario

# Vistas CategEvento 
class CategEventoListCreateView(generics.ListCreateAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer
    permission_classes = [IsAdminOrReadOnly]  # Publico lectura, admin escritura

class CategEventoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategEvento.objects.all()
    serializer_class = CategEventoSerializer
    permission_classes = [IsAdminOrReadOnly]  # Publico lectura, admin escritura


# Vistas Ubicacion
class UbicacionListCreateView(generics.ListCreateAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAdminOrReadOnly]  # Publico lectura, admin escritura

class UbicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAdminOrReadOnly]  # Publico lectura, admin escritura

# Vistas Inscripcion
class InscripcionListCreateView(generics.ListCreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden inscribirse

class InscripcionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados

    # METODO PARA ACTUALIZAR INSCRIPCION (Lógica de Cupos)
    def perform_update(self, serializer):
        # 1. Obtener la instancia actual antes de guardar cambios
        instance = self.get_object()
        # 2. Obtener el nuevo estado que se intenta guardar
        nuevo_estado = serializer.validated_data.get('estado', instance.estado)
        evento = instance.evento
        
        print(f"--- PROCESANDO ACTUALIZACION CUPOS ---")
        print(f"Estado anterior: {instance.estado}")
        print(f"Nuevo estado: {nuevo_estado}")
        print(f"Cupos actuales: {evento.cupos_disponibles}")

        # 3. Lógica para reducir cupos (Pendiente/Cancelada -> Confirmada)
        if instance.estado != 'confirmada' and nuevo_estado == 'confirmada':
            # Verificar si hay cupos
            if evento.cupos_disponibles > 0:
                evento.cupos_disponibles -= 1
                evento.save()
                print("Cupo reducido -1")
            else:
                # Si no hay cupos, lanzar error de validación
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"error": "No hay cupos disponibles. No se puede confirmar la inscripción."})
        
        # 4. Lógica para liberar cupos (Confirmada -> Cancelada/Pendiente)
        elif instance.estado == 'confirmada' and nuevo_estado != 'confirmada':
            # Solo sumar si no excede el maximo (opcional, pero buena practica por integridad)
            if evento.cupos_disponibles < evento.cupo_maximo:
                evento.cupos_disponibles += 1
                evento.save()
                print("Cupo incrementado +1")
            else:
                 print("Intento de sumar cupo pero ya esta lleno (consistencia de datos)")

        # 5. Guardar el cambio de estado
        serializer.save()

    # METODO PARA ELIMINAR INSCRIPCION (Lógica de Cupos)
    def perform_destroy(self, instance):
        # Si se borra una inscripción que estaba confirmada, liberar el cupo
        if instance.estado == 'confirmada':
            evento = instance.evento
            if evento.cupos_disponibles < evento.cupo_maximo:
                evento.cupos_disponibles += 1
                evento.save()
                print("Inscripcion borrada. Cupo incrementado +1")
        
        # Ejecutar borrado
        instance.delete()

# Vista para obtener inscripciones del usuario actual
class MisInscripcionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtener inscripciones del usuario autenticado
        inscripciones = Inscripcion.objects.filter(usuario=request.user).select_related('evento')
        
        # Serializar con información del evento
        data = []
        for inscripcion in inscripciones:
            data.append({
                'id': inscripcion.id,
                'evento_id': inscripcion.evento.id,
                'evento_nombre': inscripcion.evento.nombre,
                'evento_fecha_inicio': inscripcion.evento.fecha_inicio,
                'evento_fecha_fin': inscripcion.evento.fecha_fin,
                'evento_hora_inicio': str(inscripcion.evento.hora_inicio) if inscripcion.evento.hora_inicio else None,
                'evento_hora_fin': str(inscripcion.evento.hora_fin) if inscripcion.evento.hora_fin else None,
                'fecha_inscripcion': inscripcion.fecha_inscripcion,
                'estado': inscripcion.estado,
                'comentarios': inscripcion.comentarios
            })
        
        return Response(data)


# Vista de reseña
class ResenaListCreateView(generics.ListCreateAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Lectura publica, escritura autenticada

class ResenaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer
    permission_classes = [IsOwnerOrAdmin]  # Dueño o Admin


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

class EventoListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly] # Lectura publica, escritura autenticada

    def get(self, request):
        eventos = Evento.objects.all()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            # Verificar permisos (solo admin puede crear)
            if not request.user.is_staff and not request.user.groups.filter(name='admin').exists():
                 return Response({'error': 'No tienes permisos para crear eventos'}, status=403)

            # Extraer imagen ANTES de copiar data
            imagen = request.FILES.get('imagen')
            imagen_url = request.data.get('imagen_url')
            
            # Copiar datos SIN la imagen (que ya esta en FILES)
            data = {}
            for key in request.data:
                if key not in ['imagen', 'imagen_url']:
                    data[key] = request.data[key]
            
            print(f"=== PROCESANDO IMAGEN ===")
            print(f"Tiene imagen (FILES): {imagen is not None}")
            print(f"Tiene imagen_url: {imagen_url}")
            
            # Guardar imagen en MongoDB si existe
            if imagen or imagen_url:
                mongo_utils = UtilidadesMongo()
                
                if imagen:
                    print(f"Guardando imagen en MongoDB...")
                    imagen_id = mongo_utils.guardar_archivo(imagen)
                    print(f"Imagen guardada con ID: {imagen_id}")
                    data['imagen_id'] = str(imagen_id)
                elif imagen_url:
                    print(f"Descargando imagen desde URL...")
                    imagen_id = mongo_utils.descargar_y_guardar_imagen(imagen_url)
                    print(f"Imagen descargada con ID: {imagen_id}")
                    data['imagen_id'] = str(imagen_id)
                
            print(f"===SERIALIZANDO EVENTO ===")
            print(f"Data keys: {data.keys()}")
            
            serializer = EventoSerializer(data=data)
            if serializer.is_valid():
                print(f"Serializer válido, guardando...")
                evento = serializer.save()
                print(f"Evento guardado con ID: {evento.id}")
                return Response(serializer.data, status=201)
            else:
                print(f"=== ERRORES DE VALIDACIÓN ===")
                print(f"Errors: {serializer.errors}")
                return Response(serializer.errors, status=400)
        except Exception as e:
            import traceback
            print(f"=== ERROR INTERNO ===")
            print(f"Error: {str(e)}")
            traceback.print_exc()
            return Response({'error': f'Error interno: {str(e)}'}, status=500)

class EventoDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Evento.objects.get(pk=pk)
        except Evento.DoesNotExist:
            return None

    def get(self, request, pk):
        evento = self.get_object(pk)
        if not evento:
            return Response({'error': 'Evento no encontrado'}, status=404)
        serializer = EventoSerializer(evento)
        return Response(serializer.data)

    def put(self, request, pk):
        # Verificar permisos
        if not request.user.is_staff and not request.user.groups.filter(name='admin').exists():
             return Response({'error': 'No tienes permisos para editar eventos'}, status=403)
             
        evento = self.get_object(pk)
        if not evento:
            return Response({'error': 'Evento no encontrado'}, status=404)
        
        # Extraer imagen ANTES de copiar data
        imagen = request.FILES.get('imagen')
        imagen_url = request.data.get('imagen_url')
        
        # Copiar datos SIN la imagen
        data = {}
        for key in request.data:
            if key not in ['imagen', 'imagen_url']:
                data[key] = request.data[key]
        
        # Guardar imagen en MongoDB si existe
        if imagen or imagen_url:
            mongo_utils = UtilidadesMongo()
            
            if imagen:
                imagen_id = mongo_utils.guardar_archivo(imagen)
                data['imagen_id'] = str(imagen_id)
            elif imagen_url:
                imagen_id = mongo_utils.descargar_y_guardar_imagen(imagen_url)
                data['imagen_id'] = str(imagen_id)
                
        serializer = EventoSerializer(evento, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        # Verificar permisos
        if not request.user.is_staff and not request.user.groups.filter(name='admin').exists():
             return Response({'error': 'No tienes permisos para eliminar eventos'}, status=403)
             
        evento = self.get_object(pk)
        if not evento:
            return Response({'error': 'Evento no encontrado'}, status=404)
        evento.delete()
        return Response(status=204)

class EventoImagenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, imagen_id):
        mongo_utils = UtilidadesMongo()
        archivo = mongo_utils.obtener_archivo(imagen_id)
        
        if archivo:
            response = HttpResponse(archivo.read(), content_type=archivo.content_type)
            return response
        return Response({'error': 'Imagen no encontrada'}, status=404)

# Vista para obtener las categorías mas populares (o sea con mas eventos)
class CategEventoPopularesView(APIView):
    permission_classes = [AllowAny]  # Acceso publico para mostrar en el home

    def get(self, request):
        # Obtener las categorias con conteo de eventos, ordenadas por la cantidad de eventos de mayor a menor
        categorias = CategEvento.objects.annotate(
            cantidad_eventos=Count('eventos')
        ).filter(
            estado=True,
            cantidad_eventos__gt=0
        ).order_by('-cantidad_eventos')[:5]
        
        # Serializar manualmente para incluir cantidad_eventos
        data = []
        for categoria in categorias:
            data.append({
                'id': categoria.id,
                'nombre': categoria.nombre,
                'descripcion': categoria.descripcion,
                'estado': categoria.estado,
                'cantidad_eventos': categoria.cantidad_eventos
            })
        return Response(data)


# Vista para la Configuración Global del Perfil
class ConfiguracionPerfilView(APIView):
    # GET: Publico (o autenticado) para que el front sepa que campo bloquear
    # PUT: Solo Admin
    
    def get_permissions(self):
        if self.request.method == 'PUT':
            return [IsAdminUser()]
        return [AllowAny()] # Permitir que cualquiera lea la config (necesario para login/registro/perfil)

    def get_object(self):
        # Obtener la unica instancia o crearla si no existe
        config, created = ConfiguracionPerfil.objects.get_or_create(id=1)
        return config

    def get(self, request):
        config = self.get_object()
        serializer = ConfiguracionPerfilSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = self.get_object()
        serializer = ConfiguracionPerfilSerializer(config, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)