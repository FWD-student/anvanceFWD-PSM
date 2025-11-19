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
    
    # ubicacion
    path('Ubicacion/', UbicacionListCreateView.as_view(), name="crear y listar ubicaciones"),
    path('Ubicacion/<int:pk>/', UbicacionDetailView.as_view(), name="actualizar y eliminar ubicacion"),
    
    # evento
    path('Evento/', EventoListCreateView.as_view(), name="crear y listar eventos"),
    path('Evento/<int:pk>/', EventoDetailView.as_view(), name="actualizar y eliminar evento"),
    
    # inscripcion
    path('Inscripcion/', InscripcionListCreateView.as_view(), name="crear y listar inscripciones"),
    path('Inscripcion/<int:pk>/', InscripcionDetailView.as_view(), name="actualizar y eliminar inscripcion"),
    
    # resena
    path('Resena/', ResenaListCreateView.as_view(), name="crear y listar resenhas"),
    path('Resena/<int:pk>/', ResenaDetailView.as_view(), name="actualizar y eliminar resena"),

    # contacto
    path('Contacto/', ContactoListCreateView.as_view(), name="crear y listar mensajes de contacto"),
]