from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text
import datetime

db = SQLAlchemy()


class MissingCase(db.Model):
    __tablename__ = 'cases'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    last_seen_location = db.Column(db.String(255))
    description = db.Column(db.Text)
    photo_url = db.Column(db.String(255))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    # ArcFace моделі 512 өлшемді вектор береді
    face_vector = db.Column(Vector(512))
    status = db.Column(db.String(20), default='active')  # active / found
    reporter_name = db.Column(db.String(100))
    reporter_contact = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'age': self.age,
            'last_seen_location': self.last_seen_location,
            'description': self.description,
            'photo_url': self.photo_url,
            'lat': self.lat,
            'lng': self.lng,
            'status': self.status,
            'reporter_name': self.reporter_name,
            'reporter_contact': self.reporter_contact,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Sighting(db.Model):
    __tablename__ = 'sightings'
    id = db.Column(db.Integer, primary_key=True)
    image_path = db.Column(db.String(255))
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    location_name = db.Column(db.String(255))
    reporter_name = db.Column(db.String(100))
    reporter_contact = db.Column(db.String(100))
    notes = db.Column(db.Text)
    face_vector = db.Column(Vector(512))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'image_path': self.image_path,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'location_name': self.location_name,
            'reporter_name': self.reporter_name,
            'notes': self.notes,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }


class Match(db.Model):
    __tablename__ = 'matches'
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    sighting_id = db.Column(db.Integer, db.ForeignKey('sightings.id'), nullable=False)
    similarity_score = db.Column(db.Float)  # 0-100%
    status = db.Column(db.String(20), default='pending')  # pending / confirmed / dismissed
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    case = db.relationship('MissingCase', backref='matches')
    sighting = db.relationship('Sighting', backref='matches')

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'sighting_id': self.sighting_id,
            'similarity_score': self.similarity_score,
            'status': self.status,
            'case': self.case.to_dict() if self.case else None,
            'sighting': self.sighting.to_dict() if self.sighting else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
