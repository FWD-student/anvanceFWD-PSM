from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, UserGroupView,
    UserListCreateView, UserDetailView,
    CategEventoListCreateView, CategEventoDetailView, CategEventoPopularesView,
    UbicacionListCreateView, UbicacionDetailView,
    InscripcionListCreateView, InscripcionDetailView, MisInscripcionesView,
    EventoListCreateView, EventoDetailView,
    ResenaListCreateView, ResenaDetailView,
    ContactoListCreateView,
    ConfiguracionPerfilView,
    ValidarCedulaTSEView,
    EstadisticasView,
    EnviarCodigoVerificacionView, VerificarCodigoView,
    GenerarCodigoWhatsAppView, ValidarCodigoWhatsAppView, VerificarAutorizacionView,
    # CrearSuperUsuarioView, SeedDataView
)
from .n8n_views import (N8NCrearEventoView, N8NEventoPendienteView, N8NEventoPendienteDetailView, N8NConfirmarEventoView, AdminEventosPendientesView, AdminAprobarEventoView, AdminRechazarEventoView)

urlpatterns = [

    # auth y roles
    path('register/', RegisterView.as_view(), name="registro de usuarios"),
    path('token/', CustomTokenObtainPairView.as_view(), name="login token"),
    path('usergroup/', UserGroupView.as_view(), name="asignar roles"),

    # user (autenticacion)
    path('User/', UserListCreateView.as_view(), name="crear y listar usuarios"),
    path('User/<int:pk>/', UserDetailView.as_view(), name="actualizar y eliminar usuario"),
    
    # categEvento
    path('CategEvento/', CategEventoListCreateView.as_view(), name="crear y listar categorias"),
    path('CategEvento/<int:pk>/', CategEventoDetailView.as_view(), name="actualizar y eliminar categoria"),
    path('CategEvento/populares/', CategEventoPopularesView.as_view(), name="categorias populares"),
    path('Resena/', ResenaListCreateView.as_view(), name="crear y listar resenhas"),
    path('Resena/<int:pk>/', ResenaDetailView.as_view(), name="actualizar y eliminar resena"),

    # contacto
    path('Contacto/', ContactoListCreateView.as_view(), name="crear y listar mensajes de contacto"),

    # Ubicacion
    path('Ubicacion/', UbicacionListCreateView.as_view(), name="crear y listar ubicaciones"),
    path('Ubicacion/<int:pk>/', UbicacionDetailView.as_view(), name="actualizar y eliminar ubicacion"),

    # Inscripcion
    path('Inscripcion/', InscripcionListCreateView.as_view(), name="crear y listar inscripciones"),
    path('Inscripcion/<int:pk>/', InscripcionDetailView.as_view(), name="actualizar y eliminar inscripcion"),
    path('Inscripcion/mis-inscripciones/', MisInscripcionesView.as_view(), name="mis inscripciones"),

    # Eventos
    path('Evento/', EventoListCreateView.as_view(), name="crear y listar eventos"),
    path('Evento/<int:pk>/', EventoDetailView.as_view(), name="detalle evento"),
    # Nota: El endpoint de imagen ya no es necesario con Cloudinary, las imágenes se sirven directamente desde Cloudinary

    # Configuracion Global
    path('configuracion/perfil/', ConfiguracionPerfilView.as_view(), name="configuracion perfil"),
    # Validación TSE
    path('validar-cedula/', ValidarCedulaTSEView.as_view(), name="validar cedula TSE"),
    # Estadísticas para el admin
    path('estadisticas/', EstadisticasView.as_view(), name="estadisticas dashboard"),
    # Validación del Email
    path('enviar-codigo/', EnviarCodigoVerificacionView.as_view(), name="enviar codigo verificacion"),
    path('verificar-codigo/', VerificarCodigoView.as_view(), name="verificar codigo"),
    # Endpoint para n8n (automatizaciones)
    path('n8n/crear-evento/', N8NCrearEventoView.as_view(), name="n8n crear evento"),
    # Endpoints para flujo de confirmacion por WhatsApp
    path('n8n/evento-pendiente/', N8NEventoPendienteView.as_view(), name="n8n evento pendiente"),
    path('n8n/evento-pendiente/<str:token>/', N8NEventoPendienteDetailView.as_view(), name="n8n editar pendiente"),
    path('n8n/confirmar/<str:token>/', N8NConfirmarEventoView.as_view(), name="n8n confirmar evento"),
    # Endpoint para generar código de autenticación WhatsApp (admin)
    path('whatsapp/generar-codigo/', GenerarCodigoWhatsAppView.as_view(), name="generar codigo whatsapp"),
    # Endpoint para validar código desde n8n (no requiere JWT, solo API Key)
    path('whatsapp/validar-codigo/', ValidarCodigoWhatsAppView.as_view(), name="validar codigo whatsapp"),
    # Endpoint para verificar si un telefono esta autorizado
    path('whatsapp/verificar-autorizacion/', VerificarAutorizacionView.as_view(), name="verificar autorizacion"),
    
    # Admin Panel - Gestión de eventos pendientes (JWT Auth)
    path('n8n/eventos-pendientes/', AdminEventosPendientesView.as_view(), name="admin listar pendientes"),
    path('n8n/aprobar-evento/<str:token>/', AdminAprobarEventoView.as_view(), name="admin aprobar evento"),
    path('n8n/rechazar-evento/<str:token>/', AdminRechazarEventoView.as_view(), name="admin rechazar evento"),
]