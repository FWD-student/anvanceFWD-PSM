from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Evento, CategEvento, Ubicacion, EventoPendiente, CodigoWhatsApp
from .mongo_utils import UtilidadesMongo
import base64
import json
import uuid
from datetime import date, timedelta

def verificar_codigo_whatsapp(codigo):
    """
    Verifica que el código de WhatsApp sea válido y esté activo.
    Retorna el objeto CodigoWhatsApp si es válido, None si no.
    """
    if not codigo:
        return None
    
    try:
        codigo_obj = CodigoWhatsApp.objects.get(codigo=codigo, activo=True)
        if codigo_obj.esta_vigente():
            return codigo_obj
        return None
    except CodigoWhatsApp.DoesNotExist:
        return None


class N8NCrearEventoView(APIView):
    
    # Sin autenticacion JWT, usamos API Key
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        # Verificar API Key
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response(
                {'error': 'API Key invalida o no proporcionada'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            data = request.data
            
            # Si los datos vienen anidados en 'output' (desde n8n Image Parser)
            if 'output' in data and isinstance(data['output'], dict):
                data = data['output']
            
            print(f"=== N8N: Creando evento ===")
            print(f"Datos recibidos: {json.dumps(data, indent=2, default=str)}")
            
            # Buscar o crear categoria
            categoria_nombre = data.get('categoria_nombre', '').strip() if data.get('categoria_nombre') else ''
            categoria = None
            if categoria_nombre:
                categoria = CategEvento.objects.filter(
                    nombre__icontains=categoria_nombre
                ).first()
                if not categoria:
                    # Crear categoria nueva
                    categoria = CategEvento.objects.create(
                        nombre=categoria_nombre,
                        descripcion=f'Categoria creada automaticamente desde n8n',
                        estado=True
                    )
                    print(f"Categoria creada: {categoria.nombre}")
            
            # Si no hay categoria, usar o crear una por defecto
            if not categoria:
                categoria = CategEvento.objects.filter(nombre__icontains='General').first()
                if not categoria:
                    categoria = CategEvento.objects.create(
                        nombre='General',
                        descripcion='Categoria general para eventos',
                        estado=True
                    )
                print(f"Usando categoria por defecto: {categoria.nombre}")
            
            # Buscar o crear ubicacion
            ubicacion_nombre = data.get('ubicacion_nombre', '').strip() if data.get('ubicacion_nombre') else ''
            ubicacion = None
            if ubicacion_nombre:
                ubicacion = Ubicacion.objects.filter(
                    recinto__icontains=ubicacion_nombre
                ).first()
                if not ubicacion:
                    # Crear ubicacion nueva (sin direccion por ahora)
                    ubicacion = Ubicacion.objects.create(
                        recinto=ubicacion_nombre,
                        direccion='https://maps.google.com',  # URL placeholder
                        telefono_contacto=''
                    )
                    print(f"Ubicacion creada: {ubicacion.recinto}")
            
            # Si no hay ubicacion, usar o crear una por defecto
            if not ubicacion:
                ubicacion = Ubicacion.objects.filter(recinto__icontains='Por definir').first()
                if not ubicacion:
                    ubicacion = Ubicacion.objects.create(
                        recinto='Por definir',
                        direccion='https://maps.google.com',
                        telefono_contacto=''
                    )
                print(f"Usando ubicacion por defecto: {ubicacion.recinto}")
            
            # Procesar dias de la semana
            dias_semana = data.get('dias_semana') or []
            if isinstance(dias_semana, str):
                try:
                    dias_semana = json.loads(dias_semana)
                except:
                    dias_semana = [dias_semana]
            
            # Manejar fechas null - usar fecha actual como default
            fecha_inicio = data.get('fecha_inicio')
            fecha_fin = data.get('fecha_fin')
            
            # Si no hay fecha_inicio, usar la fecha de hoy
            if not fecha_inicio:
                fecha_inicio = date.today().isoformat()
                print(f"fecha_inicio no proporcionada, usando fecha actual: {fecha_inicio}")
            
            # Si no hay fecha_fin, usar fecha_inicio
            if not fecha_fin:
                fecha_fin = fecha_inicio
                print(f"fecha_fin no proporcionada, usando fecha_inicio: {fecha_fin}")
            
            # Procesar imagen si viene en base64
            imagen_id = None
            imagen_base64 = data.get('imagen_base64')
            imagen_url = data.get('imagen_url')
            
            if imagen_base64 or imagen_url:
                mongo_utils = UtilidadesMongo()
                
                if imagen_base64:
                    # Decodificar base64 y guardar
                    try:
                        # Remover prefijo data:image/...;base64, si existe
                        if ',' in imagen_base64:
                            imagen_base64 = imagen_base64.split(',')[1]
                        
                        imagen_bytes = base64.b64decode(imagen_base64)
                        
                        # Guardar en MongoDB
                        from io import BytesIO
                        archivo = BytesIO(imagen_bytes)
                        archivo.name = f"evento_{data.get('nombre', 'sin_nombre')}.jpg"
                        imagen_id = mongo_utils.guardar_archivo(archivo)
                        print(f"Imagen guardada desde base64: {imagen_id}")
                    except Exception as e:
                        print(f"Error procesando imagen base64: {e}")
                
                elif imagen_url:
                    try:
                        imagen_id = mongo_utils.descargar_y_guardar_imagen(imagen_url)
                        print(f"Imagen descargada desde URL: {imagen_id}")
                    except Exception as e:
                        print(f"Error descargando imagen: {e}")
            
            # Crear el evento
            # Determinar si los datos estan completos
            campos_faltantes = []
            if not data.get('nombre'):
                campos_faltantes.append('nombre')
            if not data.get('descripcion'):
                campos_faltantes.append('descripcion')
            if not data.get('fecha_inicio'):
                campos_faltantes.append('fecha_inicio')
            
            datos_completos = len(campos_faltantes) == 0
            
            evento = Evento.objects.create(
                nombre=data.get('nombre', 'Evento sin nombre'),
                descripcion=data.get('descripcion', ''),
                categoria=categoria,
                ubicacion=ubicacion,
                fecha_inicio=fecha_inicio,  # Ahora usa la variable procesada
                fecha_fin=fecha_fin,  # Ahora usa la variable procesada
                hora_inicio=data.get('hora_inicio') or '08:00',
                hora_fin=data.get('hora_fin') or '17:00',
                dias_semana=dias_semana,
                cupo_maximo=int(data.get('cupo_maximo') or 50),
                cupos_disponibles=int(data.get('cupos_disponibles') or data.get('cupo_maximo') or 50),
                edad_minima=data.get('edad_minima') if data.get('edad_minima') else None,
                edad_maxima=data.get('edad_maxima') if data.get('edad_maxima') else None,
                requisitos=data.get('requisitos') or '',
                imagen_id=str(imagen_id) if imagen_id else None,
                estado='activo',
                origen='whatsapp',  # Marcado como origen WhatsApp
                datos_completos=datos_completos  # True si tiene todos los campos importantes
            )
            
            print(f"Evento creado exitosamente: {evento.id} - {evento.nombre} (completo: {datos_completos})")
            
            return Response({
                'success': True,
                'mensaje': f'Evento "{evento.nombre}" creado exitosamente',
                'evento_id': evento.id,
                'categoria': categoria.nombre,
                'ubicacion': ubicacion.recinto,
                'datos_completos': datos_completos,
                'campos_faltantes': campos_faltantes
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"=== ERROR N8N ===")
            traceback.print_exc()
            return Response({
                'error': f'Error al crear evento: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class N8NEventoPendienteView(APIView):
    """
    Crear un evento pendiente que espera confirmacion del admin por WhatsApp.
    
    POST - Crea un evento pendiente y devuelve un token unico.
    GET - Lista todos los eventos pendientes (para debug).
    """
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        # Verificar API Key
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response(
                {'error': 'API Key invalida'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            data = request.data
            
            # Si los datos vienen anidados en 'output'
            if 'output' in data and isinstance(data['output'], dict):
                data = data['output']
            
            # Generar token unico
            token = str(uuid.uuid4())[:8]  # Token corto para facilitar uso
            
            # Guardar imagen_base64 por separado si viene
            imagen_base64 = data.pop('imagen_base64', None)
            
            # Crear evento pendiente
            pendiente = EventoPendiente.objects.create(
                token=token,
                datos_json=data,
                imagen_base64=imagen_base64
            )
            
            print(f"=== Evento pendiente creado: {token} ===")
            print(f"Datos: {json.dumps(data, indent=2, default=str)}")
            
            return Response({
                'success': True,
                'token': token,
                'mensaje': 'Evento pendiente creado, esperando confirmacion',
                'datos': data,
                'campos_editables': [
                    'nombre', 'descripcion', 'categoria_nombre', 'ubicacion_nombre',
                    'fecha_inicio', 'fecha_fin', 'hora_inicio', 'hora_fin',
                    'dias_semana', 'cupo_maximo'
                ]
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al crear evento pendiente: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Lista eventos pendientes (solo para debug/testing)."""
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        pendientes = EventoPendiente.objects.filter(estado='pendiente')
        data = [{
            'token': p.token,
            'datos': p.datos_json,
            'creado_en': p.creado_en.isoformat(),
            'expirado': p.esta_expirado()
        } for p in pendientes]
        
        return Response({'pendientes': data, 'total': len(data)})

class N8NEventoPendienteDetailView(APIView):
    """
    Editar o eliminar un evento pendiente.
    
    PATCH - Edita campos especificos del evento pendiente.
    DELETE - Rechaza/elimina el evento pendiente.
    """
    authentication_classes = []
    permission_classes = []
    
    def patch(self, request, token):
        """Editar campos del evento pendiente."""
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verificar codigo de autorizacion
        codigo_auth = request.data.get('codigo_auth', '')
        codigo_valido = verificar_codigo_whatsapp(codigo_auth)
        if not codigo_valido:
            return Response(
                {'error': 'Código de autorización inválido o expirado. Genera uno nuevo desde el panel admin.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            pendiente = EventoPendiente.objects.get(token=token, estado='pendiente')
            
            if pendiente.esta_expirado():
                pendiente.estado = 'rechazado'
                pendiente.save()
                return Response({'error': 'Evento expirado'}, status=status.HTTP_410_GONE)
            
            # Campos que se pueden editar
            campos_editables = ['nombre', 'descripcion', 'categoria_nombre', 'ubicacion_nombre',
                               'fecha_inicio', 'fecha_fin', 'hora_inicio', 'hora_fin',
                               'dias_semana', 'cupo_maximo']
            
            # Actualizar solo los campos enviados
            datos = pendiente.datos_json.copy()
            campos_actualizados = []
            
            for campo in campos_editables:
                if campo in request.data:
                    datos[campo] = request.data[campo]
                    campos_actualizados.append(campo)
            
            pendiente.datos_json = datos
            pendiente.save()
            
            print(f"=== Evento pendiente {token} editado ===")
            print(f"Campos: {campos_actualizados}")
            
            return Response({
                'success': True,
                'token': token,
                'mensaje': f'Campos actualizados: {", ".join(campos_actualizados)}',
                'datos_actualizados': datos
            })
            
        except EventoPendiente.DoesNotExist:
            return Response({'error': 'Evento pendiente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, token):
        """Rechazar/eliminar evento pendiente."""
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verificar codigo de autorizacion
        codigo_auth = request.data.get('codigo_auth', '')
        codigo_valido = verificar_codigo_whatsapp(codigo_auth)
        if not codigo_valido:
            return Response(
                {'error': 'Código de autorización inválido o expirado. Genera uno nuevo desde el panel admin.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            pendiente = EventoPendiente.objects.get(token=token)
            pendiente.estado = 'rechazado'
            pendiente.save()
            
            print(f"=== Evento pendiente {token} rechazado ===")
            
            return Response({
                'success': True,
                'mensaje': f'Evento rechazado y marcado para eliminacion'
            })
            
        except EventoPendiente.DoesNotExist:
            return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class N8NConfirmarEventoView(APIView):
    """
    Confirmar un evento pendiente y crearlo en la base de datos real.
    Solo el admin autorizado puede confirmar.
    """
    authentication_classes = []
    permission_classes = []
    
    def post(self, request, token):
        api_key = request.headers.get('X-API-Key', '')
        if api_key != settings.N8N_API_KEY:
            return Response({'error': 'API Key invalida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verificar codigo de autorizacion
        codigo_auth = request.data.get('codigo_auth', '')
        codigo_valido = verificar_codigo_whatsapp(codigo_auth)
        if not codigo_valido:
            return Response(
                {'error': 'Código de autorización inválido o expirado. Genera uno nuevo desde el panel admin.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            pendiente = EventoPendiente.objects.get(token=token, estado='pendiente')
            
            if pendiente.esta_expirado():
                pendiente.estado = 'rechazado'
                pendiente.save()
                return Response({'error': 'Evento expirado'}, status=status.HTTP_410_GONE)
            
            data = pendiente.datos_json
            
            # ===== Logica de creacion del evento (copiada de N8NCrearEventoView) =====
            
            # Buscar o crear categoria
            categoria_nombre = data.get('categoria_nombre', '').strip() if data.get('categoria_nombre') else ''
            categoria = None
            if categoria_nombre:
                categoria = CategEvento.objects.filter(nombre__icontains=categoria_nombre).first()
                if not categoria:
                    categoria = CategEvento.objects.create(
                        nombre=categoria_nombre,
                        descripcion='Categoria creada automaticamente desde n8n',
                        estado=True
                    )
            if not categoria:
                categoria = CategEvento.objects.filter(nombre__icontains='General').first()
                if not categoria:
                    categoria = CategEvento.objects.create(
                        nombre='General', descripcion='Categoria general', estado=True
                    )
            
            # Buscar o crear ubicacion
            ubicacion_nombre = data.get('ubicacion_nombre', '').strip() if data.get('ubicacion_nombre') else ''
            ubicacion = None
            if ubicacion_nombre:
                ubicacion = Ubicacion.objects.filter(recinto__icontains=ubicacion_nombre).first()
                if not ubicacion:
                    ubicacion = Ubicacion.objects.create(
                        recinto=ubicacion_nombre,
                        direccion='https://maps.google.com',
                        telefono_contacto=''
                    )
            if not ubicacion:
                ubicacion = Ubicacion.objects.filter(recinto__icontains='Por definir').first()
                if not ubicacion:
                    ubicacion = Ubicacion.objects.create(
                        recinto='Por definir', direccion='https://maps.google.com', telefono_contacto=''
                    )
            
            # Procesar dias de la semana
            dias_semana = data.get('dias_semana', [])
            if isinstance(dias_semana, str):
                try:
                    dias_semana = json.loads(dias_semana)
                except:
                    dias_semana = [dias_semana]
            
            # Manejar fechas
            fecha_inicio = data.get('fecha_inicio') or date.today().isoformat()
            fecha_fin = data.get('fecha_fin') or fecha_inicio
            
            # Procesar imagen si existe
            imagen_id = None
            if pendiente.imagen_base64:
                try:
                    mongo_utils = UtilidadesMongo()
                    imagen_bytes = base64.b64decode(pendiente.imagen_base64)
                    from io import BytesIO
                    archivo = BytesIO(imagen_bytes)
                    archivo.name = f"evento_{data.get('nombre', 'sin_nombre')}.jpg"
                    imagen_id = mongo_utils.guardar_archivo(archivo)
                except Exception as e:
                    print(f"Error guardando imagen: {e}")
            
            # Crear evento real
            evento = Evento.objects.create(
                nombre=data.get('nombre', 'Evento sin nombre'),
                descripcion=data.get('descripcion', ''),
                categoria=categoria,
                ubicacion=ubicacion,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                hora_inicio=data.get('hora_inicio') or '08:00',
                hora_fin=data.get('hora_fin') or '17:00',
                dias_semana=dias_semana,
                cupo_maximo=int(data.get('cupo_maximo') or 50),
                cupos_disponibles=int(data.get('cupo_maximo') or 50),
                edad_minima=data.get('edad_minima') if data.get('edad_minima') else None,
                edad_maxima=data.get('edad_maxima') if data.get('edad_maxima') else None,
                requisitos=data.get('requisitos', ''),
                imagen_id=str(imagen_id) if imagen_id else None,
                estado='activo'
            )
            
            # Marcar pendiente como confirmado
            pendiente.estado = 'confirmado'
            pendiente.save()
            
            print(f"=== Evento confirmado y creado: {evento.id} - {evento.nombre} ===")
            
            return Response({
                'success': True,
                'mensaje': f'Evento "{evento.nombre}" creado exitosamente',
                'evento_id': evento.id,
                'categoria': categoria.nombre,
                'ubicacion': ubicacion.recinto
            }, status=status.HTTP_201_CREATED)
            
        except EventoPendiente.DoesNotExist:
            return Response({'error': 'Evento pendiente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)