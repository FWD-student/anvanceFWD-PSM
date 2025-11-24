# api/services/mongo_service.py

from pymongo import MongoClient
from django.conf import settings
import gridfs
from bson import ObjectId

class MongoDBService:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            config = settings.MONGODB_CONFIG
            # Conexión simple sin autenticación
            self._client = MongoClient(
                host=config['host'],
                port=config['port']
            )
            self._db = self._client[config['database']]
            self.fs = gridfs.GridFS(self._db)
    
    def save_image(self, file, metadata=None):
        """Guarda imagen en MongoDB usando GridFS"""
        file_id = self.fs.put(
            file.read(),
            filename=file.name,
            content_type=file.content_type,
            metadata=metadata or {}
        )
        return str(file_id)
    
    def get_image(self, file_id):
        """Recupera imagen de MongoDB"""
        return self.fs.get(ObjectId(file_id))
    
    def delete_image(self, file_id):
        """Elimina imagen de MongoDB"""
        self.fs.delete(ObjectId(file_id))

# ejecucion singleton
mongo_service = MongoDBService()