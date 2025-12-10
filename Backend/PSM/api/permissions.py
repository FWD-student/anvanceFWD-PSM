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


class IsAdminOrSelf(permissions.BasePermission):
    """
    Permite acceso a administradores o al propio usuario dueño del objeto.
    """
    def has_object_permission(self, request, view, obj):
        # Si no está autenticado, denegar
        if not request.user or not request.user.is_authenticated:
            return False

        # Si es admin o staff, permitir todo
        if request.user.groups.filter(name='admin').exists() or request.user.is_staff:
            return True

        # Si es el propio usuario, permitir
        return obj == request.user

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado que permite:
    - Lectura a cualquiera (o autenticado, depende de la vista).
    - Escritura a Administradores.
    - Escritura al Dueño del objeto (campo 'usuario' del modelo).
    """
    
    def has_object_permission(self, request, view, obj):
        # 1. Si es metodo seguro (GET, OPTIONS, HEAD), permitir (si pasa authenticacion de la vista)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 2. Si el usuario no esta autenticado, denegar
        if not request.user or not request.user.is_authenticated:
            return False

        # 3. Si es Admin, permitir TODO
        if request.user.groups.filter(name='admin').exists() or request.user.is_staff:
            return True

        # 4. Si es el dueño del objeto, permitir.
        #    Verificamos si el objeto tiene atributo 'usuario' (comun en Resena, Inscripcion)
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
            
        #    Si el objeto es el Usuario mismo
        return obj == request.user