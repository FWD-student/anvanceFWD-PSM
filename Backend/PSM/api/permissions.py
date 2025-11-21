from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado que verifica si el usuario pertenece al grupo 'admin'.
    Permite operaciones de lectura (GET) a usuarios autenticados.
    Permite operaciones de escritura (POST, PUT, DELETE) solo a administradores.
    """
    
    def has_permission(self, request, view):
        # El usuario debe estar autenticado
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Para metodos seguros (GET, HEAD, OPTIONS), permitir a solo usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para otros metodos (POST, PUT, DELETE), verificar si es admin
        return request.user.groups.filter(name='admin').exists()


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso que permite lectura a cualquiera (incluso no autenticados),
    pero solo permite escritura a administradores autenticados.
    """
    
    def has_permission(self, request, view):
        # Métodos seguros (GET, HEAD, OPTIONS) son permitidos para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para métodos de escritura, verificar autenticación y que sea admin
        if not request.user or not request.user.is_authenticated:
            return False
            
        return request.user.groups.filter(name='admin').exists()