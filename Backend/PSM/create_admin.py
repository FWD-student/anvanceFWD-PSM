import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PSM.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

def create_admin_user():
    username = 'admin_test' # Datos a cambiar
    password = 'adminpassword123' # Datos a cambiar
    email = 'admin@test.com' # Datos a cambiar
    
    # Crear grupo admin si no existe
    group, created = Group.objects.get_or_create(name='admin')
    if created:
        print(f"Grupo 'admin' creado.")
    else:
        print(f"Grupo 'admin' ya existe.")

    # Crear usuario
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username=username, email=email, password=password)
        print(f"Usuario '{username}' creado exitosamente.")
    else:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"Usuario '{username}' ya existía. Contraseña actualizada.")

    # Asignar grupo
    user.groups.add(group)
    user.is_staff = True # Opcional, para entrar al admin de Django también
    user.is_superuser = True # Opcional
    user.save()
    print(f"Usuario '{username}' asignado al grupo 'admin'.")
    print(f"Credenciales: Usuario: {username} | Contraseña: {password}")

if __name__ == '__main__':
    create_admin_user()

""" 
Con correr esto en consola y cambiar los datos, creo usuarios con privilegios
>>>>  python create_admin.py
 """