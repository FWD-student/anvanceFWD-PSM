from django.urls import path
from .views import *

urlpatterns = [

    # usuario
    path('Usuario/', UsuarioListCreateView.as_view(), name="crear y listar usuarios"),
    path('Usuario/<int:pk>/', UsuarioDetailView.as_view(), name="actualizar y eliminar usuario"),
    
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
    path('Resena/<int:pk>/', ResenaDetailView.as_view(), name="actualizar y eliminar resena")

]