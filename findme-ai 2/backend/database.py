import mysql.connector
from mysql.connector import Error
import uuid
import json
import numpy as np

class FindMeDatabase:
    def __init__(self, host, user, password, database):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }

    def get_connection(self):
        return mysql.connector.connect(**self.config)

    # --- РАБОТА С ЭМБЕДДИНГАМИ ---
    
    def save_face_embedding(self, person_id, embedding_array, image_url, is_ref=True):
        """Сохраняет float32 вектор как BLOB"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Конвертация numpy array в байты
        emb_bytes = embedding_array.astype(np.float32).tobytes()
        emb_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO face_embeddings (id, person_id, embedding_blob, image_url, is_reference)
        VALUES (%s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (emb_id, person_id, emb_bytes, image_url, is_ref))
            conn.commit()
            return emb_id
        except Error as e:
            print(f"Error saving embedding: {e}")
        finally:
            cursor.close()
            conn.close()

    def get_all_embeddings_for_faiss(self):
        """Загружает все векторы для инициализации FAISS индекса в памяти"""
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, embedding_blob FROM face_embeddings")
        results = cursor.fetchall()
        
        # Десериализация векторов обратно в numpy
        embeddings = []
        ids = []
        for row in results:
            vector = np.frombuffer(row['embedding_blob'], dtype=np.float32)
            embeddings.append(vector)
            ids.append(row['id'])
            
        cursor.close()
        conn.close()
        return np.array(embeddings), ids

    # --- ГИБКИЙ ПОИСК ПО АТРИБУТАМ ---

    def create_person_with_attributes(self, user_id, char_data, clothing_data):
        """Создает полную запись человека с JSON атрибутами"""
        conn = self.get_connection()
        cursor = conn.cursor()
        p_id = str(uuid.uuid4())
        
        try:
            # 1. Создаем личность
            cursor.execute("INSERT INTO persons (id, user_id) VALUES (%s, %s)", (p_id, user_id))
            
            # 2. Характеристики (JSON)
            char_query = """
            INSERT INTO characteristics (person_id, gender, hair_json, body_json, features_json)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(char_query, (
                p_id, 
                char_data.get('gender'),
                json.dumps(char_data.get('hair')),
                json.dumps(char_data.get('body')),
                json.dumps(char_data.get('features'))
            ))
            
            # 3. Одежда
            cloth_query = "INSERT INTO clothing_accessories (person_id, clothing_json) VALUES (%s, %s)"
            cursor.execute(cloth_query, (p_id, json.dumps(clothing_data)))
            
            conn.commit()
            return p_id
        except Error as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    # --- REAL-TIME ТРЕКИНГ ---

    def log_detection(self, camera_id, embedding_id, confidence, lat, lng):
        """Запись факта обнаружения для Heatmap и Timeline"""
        conn = self.get_connection()
        cursor = conn.cursor()
        det_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO detections (id, camera_id, embedding_id, confidence, lat, lng)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (det_id, camera_id, embedding_id, confidence, lat, lng))
        conn.commit()
        cursor.close()
        conn.close()
        return det_id
