from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
#Rol y auth
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsAdminOrSelf, IsOwnerOrAdmin # chequeo 
Usuario = get_user_model()
# importes necesarios para evento
from .cloudinary_utils import cloudinary_utils
from django.http import HttpResponse
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
# TSE Service para validación de cédulas
from .services.tse_service import tse_service
# Brevo Service para emails
from .services.brevo_service import brevo_service


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
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'success': True, 'message': 'Ubicacion eliminada'}, status=200)

# Vistas Inscripcion
class InscripcionListCreateView(generics.ListCreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden inscribirse
    
    def perform_create(self, serializer):
        # Asignar el usuario autenticado automaticamente
        serializer.save(usuario=self.request.user)

class InscripcionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados

    # METODO PARA ACTUALIZAR INSCRIPCION (Logica de Cupos)
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

        # 3. Logica para reducir cupos (Pendiente/Cancelada -> Confirmada)
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
            
            # Guardar imagen en Cloudinary si existe
            if imagen or imagen_url:
                if imagen:
                    print(f"Guardando imagen en Cloudinary...")
                    imagen_url_result = cloudinary_utils.guardar_archivo(imagen)
                    print(f"Imagen guardada con URL: {imagen_url_result}")
                    data['imagen_id'] = imagen_url_result
                elif imagen_url:
                    print(f"Descargando imagen desde URL...")
                    imagen_url_result = cloudinary_utils.guardar_desde_url(imagen_url)
                    print(f"Imagen descargada con URL: {imagen_url_result}")
                    data['imagen_id'] = imagen_url_result
                
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
        
        # Guardar imagen en Cloudinary si existe
        if imagen or imagen_url:
            if imagen:
                imagen_url_result = cloudinary_utils.guardar_archivo(imagen)
                data['imagen_id'] = imagen_url_result
            elif imagen_url:
                imagen_url_result = cloudinary_utils.guardar_desde_url(imagen_url)
                data['imagen_id'] = imagen_url_result
                
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
        return Response({'success': True, 'message': 'Evento eliminado'}, status=200)

# NOTA: EventoImagenView ya NO es necesaria porque Cloudinary sirve las imágenes directamente por URL
# class EventoImagenView(APIView):
    # permission_classes = [AllowAny]
    #
    # def get(self, request, imagen_id):
    #     archivo = cloudinary_utils.obtener_archivo(imagen_id)
    #
    #     if archivo:
    #         response = HttpResponse(archivo.read(), content_type=archivo.content_type)
    #         return response
    #     return Response({'error': 'Imagen no encontrada'}, status=404)

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

# Vista para validar cedulas con el TSE
class ValidarCedulaTSEView(APIView):
    """
    Endpoint para validar cedulas costarricenses contra el TSE.
    Recibe una cedula y devuelve los datos de la persona si es valida.
    """
    permission_classes = [AllowAny]  # Público para permitir validación durante registro
    
    def post(self, request):
        cedula = request.data.get('cedula', '')
        
        if not cedula:
            return Response(
                {'error': 'El campo cédula es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Consultar al TSE
        resultado = tse_service.consultar_cedula(cedula)
        
        if resultado.get('valida'):
            return Response(resultado, status=status.HTTP_200_OK)
        else:
            return Response(resultado, status=status.HTTP_400_BAD_REQUEST)

# Vista para obtener estadísticas del dashboard de administración
class EstadisticasView(APIView):
    """
    Endpoint que devuelve estadísticas agregadas para el dashboard de admin.
    Solo accesible por administradores.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        ahora = timezone.now()
        hace_7_dias = ahora - timedelta(days=7)
        hace_30_dias = ahora - timedelta(days=30)

        # ======== ESTADÍSTICAS DE USUARIOS ========
        total_usuarios = Usuario.objects.count()
        usuarios_nuevos_7d = Usuario.objects.filter(date_joined__gte=hace_7_dias).count()
        usuarios_nuevos_30d = Usuario.objects.filter(date_joined__gte=hace_30_dias).count()
        usuarios_activos = Usuario.objects.filter(last_login__gte=hace_30_dias).count()
        usuarios_inactivos = Usuario.objects.filter(last_login__lt=hace_30_dias).count() + Usuario.objects.filter(last_login__isnull=True).count()

        # ======== ESTADÍSTICAS DE EVENTOS ========
        total_eventos = Evento.objects.count()
        eventos_activos = Evento.objects.filter(estado='activo').count()
        eventos_inactivos = Evento.objects.filter(estado='inactivo').count()
        eventos_finalizados = Evento.objects.filter(estado='finalizado').count()
        
        # Eventos con cupo lleno
        eventos_llenos = Evento.objects.filter(cupos_disponibles=0).count()
        
        # Eventos más populares (por inscripciones)
        eventos_populares = Evento.objects.annotate(
            total_inscripciones=Count('inscripciones')
        ).order_by('-total_inscripciones')[:5].values('id', 'nombre', 'total_inscripciones')

        # ======== ESTADÍSTICAS DE INSCRIPCIONES ========
        total_inscripciones = Inscripcion.objects.count()
        inscripciones_pendientes = Inscripcion.objects.filter(estado='pendiente').count()
        inscripciones_confirmadas = Inscripcion.objects.filter(estado='confirmada').count()
        inscripciones_canceladas = Inscripcion.objects.filter(estado='cancelada').count()
        
        # Tasa de asistencia
        total_con_asistencia = Inscripcion.objects.filter(estado='confirmada').count()
        asistieron = Inscripcion.objects.filter(asistio=True).count()
        tasa_asistencia = round((asistieron / total_con_asistencia * 100), 1) if total_con_asistencia > 0 else 0

        # Inscripciones por mes (últimos 6 meses)
        inscripciones_por_mes = []
        for i in range(5, -1, -1):
            fecha_inicio = (ahora - timedelta(days=30*i)).replace(day=1)
            if i > 0:
                fecha_fin = (ahora - timedelta(days=30*(i-1))).replace(day=1)
            else:
                fecha_fin = ahora
            
            count = Inscripcion.objects.filter(
                fecha_inscripcion__gte=fecha_inicio,
                fecha_inscripcion__lt=fecha_fin
            ).count()
            
            inscripciones_por_mes.append({
                'mes': fecha_inicio.strftime('%b'),
                'cantidad': count
            })

        # Categorías más demandadas
        categorias_demandadas = CategEvento.objects.annotate(
            total_inscripciones=Count('eventos__inscripciones')
        ).order_by('-total_inscripciones')[:5].values('id', 'nombre', 'total_inscripciones')

        # ======== ESTADÍSTICAS DE RESEÑAS ========
        total_resenas = Resena.objects.count()
        promedio_calificacion = Resena.objects.aggregate(promedio=Avg('calificacion'))['promedio'] or 0

        # Eventos mejor calificados
        eventos_mejor_calificados = Evento.objects.annotate(
            promedio=Avg('resenas__calificacion'),
            total_resenas=Count('resenas')
        ).filter(total_resenas__gt=0).order_by('-promedio')[:5].values('id', 'nombre', 'promedio', 'total_resenas')

        # ======== ESTADÍSTICAS DE CONTACTOS ========
        total_contactos = Contacto.objects.count()
        contactos_7d = Contacto.objects.filter(fecha_envio__gte=hace_7_dias).count()
        contactos_30d = Contacto.objects.filter(fecha_envio__gte=hace_30_dias).count()

        return Response({
            'usuarios': {
                'total': total_usuarios,
                'nuevos_7d': usuarios_nuevos_7d,
                'nuevos_30d': usuarios_nuevos_30d,
                'activos': usuarios_activos,
                'inactivos': usuarios_inactivos
            },
            'eventos': {
                'total': total_eventos,
                'activos': eventos_activos,
                'inactivos': eventos_inactivos,
                'finalizados': eventos_finalizados,
                'llenos': eventos_llenos,
                'populares': list(eventos_populares)
            },
            'inscripciones': {
                'total': total_inscripciones,
                'pendientes': inscripciones_pendientes,
                'confirmadas': inscripciones_confirmadas,
                'canceladas': inscripciones_canceladas,
                'tasa_asistencia': tasa_asistencia,
                'por_mes': inscripciones_por_mes,
                'categorias_demandadas': list(categorias_demandadas)
            },
            'resenas': {
                'total': total_resenas,
                'promedio_calificacion': round(promedio_calificacion, 1) if promedio_calificacion else 0,
                'mejor_calificados': list(eventos_mejor_calificados)
            },
            'contactos': {
                'total': total_contactos,
                'ultimos_7d': contactos_7d,
                'ultimos_30d': contactos_30d
            }
        })

# Vista para enviar el código de verificación del email
class EnviarCodigoVerificacionView(APIView):
    """
    Endpoint para enviar un código de verificación al email del usuario.
    POST: { "email": "usuario@ejemplo.com" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        
        if not email:
            return Response(
                {'error': 'El campo email es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar formato de email básico
        import re
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'error': 'El formato del email no es válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si el email ya está registrado
        if Usuario.objects.filter(email=email).exists():
            return Response(
                {'error': 'Este email ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar código y guardarlo
        codigo = brevo_service.generar_codigo_verificacion()
        
        # Invalidar códigos anteriores para este email
        CodigoVerificacion.objects.filter(email=email, usado=False).update(usado=True)
        
        # Crear nuevo código
        CodigoVerificacion.objects.create(email=email, codigo=codigo)
        
        # Enviar email con el código
        resultado = brevo_service.enviar_codigo_verificacion(email, codigo)
        print(f"[INFO] Resultado envío email a {email}: {resultado}")
        
        if not resultado.get('success'):
             return Response({
                'success': False,
                'error': f"Error enviando email: {resultado.get('error')}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'success': True,
            'message': 'Código de verificación enviado correctamente a tu correo.'
        })

# Vista para verificar código
class VerificarCodigoView(APIView):
    """
    Endpoint para verificar un código de verificación.
    POST: { "email": "usuario@ejemplo.com", "codigo": "123456" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        codigo = request.data.get('codigo', '').strip()
        
        if not email or not codigo:
            return Response(
                {'error': 'Email y código son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar el código
        try:
            verificacion = CodigoVerificacion.objects.filter(
                email=email,
                codigo=codigo,
                usado=False
            ).latest('creado_en')
            
            if verificacion.es_valido():
                # Marcar como usado
                verificacion.usado = True
                verificacion.save()
                
                return Response({
                    'success': True,
                    'message': 'Email verificado correctamente',
                    'email_verificado': True
                })
            else:
                return Response({
                    'success': False,
                    'error': 'El código ha expirado. Solicita uno nuevo.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except CodigoVerificacion.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Código inválido o ya utilizado'
            }, status=status.HTTP_400_BAD_REQUEST)

# Vista para generar código de autenticación WhatsApp (solo admin)
class GenerarCodigoWhatsAppView(APIView):
    """
    Endpoint para que el admin genere un código de autenticación para WhatsApp.
    Este código se envía por chat para autorizar operaciones n8n.
    Válido por 3 días.
    
    POST: { "telefono": "+50663480444" (opcional) }
    GET: Obtener código activo del admin
    """
    permission_classes = [IsAdminUser]  # Solo admin puede generar códigos
    
    def post(self, request):
        import secrets
        
        # Verificar que es admin
        if not request.user.is_staff and not request.user.groups.filter(name='admin').exists():
            return Response({'error': 'Solo administradores pueden generar códigos'}, status=403)
        
        # Desactivar códigos anteriores del mismo usuario
        CodigoWhatsApp.objects.filter(usuario=request.user, activo=True).update(activo=False)
        
        # Generar código alfanumérico de 8 caracteres (fácil de leer/copiar)
        codigo = secrets.token_urlsafe(6)[:8].upper()  # Ej: "AB12CD34"
        
        # Calcular fecha de expiración (3 días)
        expira_en = timezone.now() + timedelta(days=3)
        
        # Obtener teléfono si lo envían
        telefono = request.data.get('telefono', '')
        
        # Crear código
        codigo_whatsapp = CodigoWhatsApp.objects.create(
            codigo=codigo,
            usuario=request.user,
            expira_en=expira_en,
            telefono_autorizado=telefono
        )
        
        return Response({
            'success': True,
            'codigo': codigo,
            'expira_en': expira_en.isoformat(),
            'tiempo_restante': codigo_whatsapp.tiempo_restante(),
            'instrucciones': f'Envía este código en el chat de WhatsApp para autorizar operaciones: {codigo}'
        }, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        """Obtener el código activo del admin."""
        if not request.user.is_staff and not request.user.groups.filter(name='admin').exists():
            return Response({'error': 'Solo administradores'}, status=403)
        
        try:
            codigo = CodigoWhatsApp.objects.filter(
                usuario=request.user,
                activo=True
            ).latest('creado_en')
            
            if codigo.esta_vigente():
                return Response({
                    'success': True,
                    'codigo': codigo.codigo,
                    'expira_en': codigo.expira_en.isoformat(),
                    'tiempo_restante': codigo.tiempo_restante(),
                    'activo': True
                })
            else:
                return Response({
                    'success': False,
                    'mensaje': 'No hay código activo. Genera uno nuevo.',
                    'activo': False
                })
        except CodigoWhatsApp.DoesNotExist:
            return Response({
                'success': False,
                'mensaje': 'No hay código generado. Genera uno nuevo.',
                'activo': False
            })


class ValidarCodigoWhatsAppView(APIView):
    """
    Endpoint para que n8n valide un código enviado por WhatsApp.
    No requiere JWT, solo la API Key de n8n.
    
    POST: { "codigo": "AB12CD34" }
    
    Respuesta exitosa:
    {
        "valido": true,
        "mensaje": "Código válido. Autorizado para procesar eventos.",
        "tiempo_restante": {"dias": 2, "horas": 15, "minutos": 30},
        "usuario": "admin@example.com"
    }
    """
    permission_classes = [AllowAny]  # n8n no tiene JWT, usa API Key
    
    def post(self, request):
        from django.conf import settings
        
        # Verificar API Key de n8n
        api_key = request.headers.get('X-API-Key', '')
        if api_key != getattr(settings, 'N8N_API_KEY', ''):
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        codigo = request.data.get('codigo', '').strip().upper()
        telefono = request.data.get('telefono', '').strip()  # Guardar telefono de WhatsApp
        
        if not codigo:
            return Response({
                'valido': False,
                'mensaje': 'Debes enviar un código'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            codigo_obj = CodigoWhatsApp.objects.get(codigo=codigo, activo=True)
            
            if codigo_obj.esta_vigente():
                # Guardar el telefono autorizado
                if telefono:
                    codigo_obj.telefono_autorizado = telefono
                    codigo_obj.save()
                
                return Response({
                    'valido': True,
                    'mensaje': 'Código válido. Autorizado para procesar eventos.',
                    'tiempo_restante': codigo_obj.tiempo_restante(),
                    'usuario': codigo_obj.usuario.email,
                    'expira_en': codigo_obj.expira_en.isoformat()
                })
            else:
                return Response({
                    'valido': False,
                    'mensaje': 'El código ha expirado. Genera uno nuevo desde el panel admin.'
                })
                
        except CodigoWhatsApp.DoesNotExist:
            return Response({
                'valido': False,
                'mensaje': 'Código inválido. Verifica que esté bien escrito.'
            })


class VerificarAutorizacionView(APIView):
    """
    Endpoint para verificar si un telefono de WhatsApp esta autorizado.
    Usado por n8n antes de procesar imagenes.
    
    POST: { "telefono": "whatsapp:+50663480444" }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        from django.conf import settings
        
        # Verificar API Key
        api_key = request.headers.get('X-API-Key', '')
        if api_key != getattr(settings, 'N8N_API_KEY', ''):
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        telefono = request.data.get('telefono', '').strip()
        
        if not telefono:
            return Response({
                'autorizado': False,
                'mensaje': 'Debes enviar el telefono'
            }, status=status.HTTP_400_BAD_REQUEST)