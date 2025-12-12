from django.urls import path
from .views import *

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
    path('Evento/', EventoListCreateView.as_view(), name="crear y listar eventos"),
    path('Evento/<int:pk>/', EventoDetailView.as_view(), name="detalle evento"),
    path('Evento/imagen/<str:imagen_id>/', EventoImagenView.as_view(), name="ver imagen evento"),

    # Configuracion Global
    path('configuracion/perfil/', ConfiguracionPerfilView.as_view(), name="configuracion perfil"),
    
    # Validación TSE
    path('validar-cedula/', ValidarCedulaTSEView.as_view(), name="validar cedula TSE"),
]