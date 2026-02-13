#Reemplaza la funcionalidad de MongoDB/GridFS
import cloudinary
import cloudinary.uploader
import cloudinary.api
import requests
from io import BytesIO
from django.conf import settings

class UtilidadesCloudinary:
    Clase para manejar archivos en Cloudinary
    
    def __init__(self):
        # Configuración ya está hecha en settings.py
        pass
    
    def guardar_archivo(self, archivo, folder='eventos'):
        
        Guarda un archivo (objeto File de Django) en Cloudinary
        Retorna la URL pública de la imagen
        
        try:
            print(f"Intentando subir archivo a Cloudinary: {archivo.name}, tamaño: {archivo.size}")
            
            # Subir a Cloudinary
            result = cloudinary.uploader.upload(
                archivo,
                folder=folder,
                resource_type='auto',
                public_id=f"{folder}/{archivo.name.split('.')[0]}"
            )
            
            url = result.get('secure_url')
            print(f"Archivo subido exitosamente a Cloudinary: {url}")
            return url
            
        except Exception as e:
            print(f"Error al subir archivo a Cloudinary: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def guardar_desde_url(self, url_imagen, folder='eventos'):
        
        Descarga una imagen desde una URL y la sube a Cloudinary
        Retorna la URL pública de la imagen en Cloudinary
        
        try:
            print(f"Descargando imagen desde URL: {url_imagen}")
            
            # Descargar la imagen
            response = requests.get(url_imagen, timeout=10)
            response.raise_for_status()
            
            # Subir a Cloudinary
            result = cloudinary.uploader.upload(
                BytesIO(response.content),
                folder=folder,
                resource_type='auto'
            )
            
            url = result.get('secure_url')
            print(f"Imagen descargada y subida a Cloudinary: {url}")
            return url
            
        except Exception as e:
            print(f"Error al descargar y subir imagen: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def guardar_desde_base64(self, base64_data, folder='eventos'):
        
        #Guarda una imagen en base64 en Cloudinary retorna la URL pública de la imagen
        
        try:
            print("Subiendo imagen base64 a Cloudinary...")
            
            # Subir a Cloudinary directamente desde base64
            result = cloudinary.uploader.upload(
                f"data:image/jpeg;base64,{base64_data}",
                folder=folder,
                resource_type='auto'
            )
            
            url = result.get('secure_url')
            print(f"Imagen base64 subida exitosamente: {url}")
            return url
            
        except Exception as e:
            print(f"Error al subir imagen base64: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def eliminar_archivo(self, public_id):
        
        #Elimina un archivo de Cloudinary por su public_id
        
        try:
            result = cloudinary.uploader.destroy(public_id)
            print(f"Archivo eliminado de Cloudinary: {public_id}")
            return result
        except Exception as e:
            print(f"Error al eliminar archivo de Cloudinary: {e}")
            return None
    
    def obtener_url(self, url_completa):
        
        #Retorna la URL de la imagen (ya está guardada en la BD)
       
        return url_completa

# Instancia global para usar en las vistas
cloudinary_utils = UtilidadesCloudinary()