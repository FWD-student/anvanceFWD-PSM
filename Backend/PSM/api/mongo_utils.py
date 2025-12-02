import gridfs
from pymongo import MongoClient
from django.conf import settings
import requests
from io import BytesIO

class UtilidadesMongo:
    def __init__(self):
        # Conexion usando la configuracion de settings.py
        config = settings.MONGODB_CONFIG
        self.client = MongoClient(
            host=config['host'],
            port=config['port']
        )
        self.db = self.client[config['database']]
        # Especificar explícitamente el nombre de la colección para GridFS
        self.fs = gridfs.GridFS(self.db, collection='imagenes')

    def guardar_archivo(self, archivo):
        """
        Guardar un archivo (objeto File de Django) en GridFS
        Retorna el ID del archivo como string para su uso en la base de datos
        """
        try:
            print(f"Intentando guardar archivo: {archivo.name}, tamaño: {archivo.size}")
            # Guardo el archivo con su nombre original y tipo de contenido
            archivo_id = self.fs.put(
                archivo.read(),  # Leer el contenido del archivo
                filename=archivo.name, 
                content_type=archivo.content_type
            )
            print(f"Archivo guardado exitosamente con ID: {archivo_id}")
            return str(archivo_id)
        except Exception as e:
            print(f"Error al guardar archivo en Mongo: {e}")
            import traceback
            traceback.print_exc()
            return None

    def obtener_archivo(self, archivo_id):
        """
        Recupera un archivo de GridFS dado su ID como string
        Retorna el objeto GridOut o None si no existe
        """
        from bson.objectid import ObjectId
        try:
            return self.fs.get(ObjectId(archivo_id))
        except Exception as e:
            print(f"Error al obtener archivo de Mongo: {e}")
            return None

    def descargar_y_guardar_imagen(self, url):
        """
        Descarga una imagen desde una URL y la guarda en GridFS
        Retorna el ID del archivo como string
        """
        try:
            response = requests.get(url)
            if response.status_code == 200:
                # Verificamos que sea una imagen por el header
                content_type = response.headers.get('Content-Type', '')
                if 'image' in content_type:
                    archivo_id = self.fs.put(
                        BytesIO(response.content),
                        filename=url.split('/')[-1] or 'imagen_descargada',
                        content_type=content_type
                    )
                    return str(archivo_id)
            return None
        except Exception as e:
            print(f"Error al descargar imagen: {e}")
            return None