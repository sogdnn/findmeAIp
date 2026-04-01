import uuid
import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import JSON, LONGBLOB

db = SQLAlchemy()

def gen_id():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255))

class Person(db.Model):
    __tablename__ = 'persons'
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    status = db.Column(db.Enum('missing', 'found', 'archive'), default='missing')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Связи (Relationships)
    characteristics = db.relationship('Characteristics', backref='person', uselist=False)
    clothing = db.relationship('ClothingAccessories', backref='person', uselist=False)
    embeddings = db.relationship('FaceEmbedding', backref='person', lazy=True)

class Characteristics(db.Model):
    __tablename__ = 'characteristics'
    person_id = db.Column(db.String(36), db.ForeignKey('persons.id'), primary_key=True)
    gender = db.Column(db.Enum('male', 'female', 'other'))
    hair_json = db.Column(JSON) # {'color': 'black', 'type': 'curly'}
    body_json = db.Column(JSON)
    features_json = db.Column(JSON)

class ClothingAccessories(db.Model):
    __tablename__ = 'clothing_accessories'
    person_id = db.Column(db.String(36), db.ForeignKey('persons.id'), primary_key=True)
    clothing_json = db.Column(JSON)
    accessories_json = db.Column(JSON)

class FaceEmbedding(db.Model):
    __tablename__ = 'face_embeddings'
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    person_id = db.Column(db.String(36), db.ForeignKey('persons.id'))
    embedding_blob = db.Column(LONGBLOB, nullable=False)
    image_url = db.Column(db.String(512))
    is_reference = db.Column(db.Boolean, default=False)

class Detection(db.Model):
    __tablename__ = 'detections'
    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    camera_id = db.Column(db.String(36), db.ForeignKey('camera_streams.id'))
    embedding_id = db.Column(db.String(36), db.ForeignKey('face_embeddings.id'))
    confidence = db.Column(db.Float)
    appearance_data = db.Column(JSON)
    lat = db.Column(db.Numeric(10, 8))
    lng = db.Column(db.Numeric(11, 8))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
