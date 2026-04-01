from flask import Blueprint, request, jsonify
from database import db, Detection, FaceEmbedding
import datetime

sightings_bp = Blueprint('sightings', __name__)

@sightings_bp.route('/detections', methods=['GET'])
def get_detections():
    """Получить список всех зафиксированных лиц с камер."""
    camera_id = request.args.get('camera_id')
    query = Detection.query
    
    if camera_id:
        query = query.filter_by(camera_id=camera_id)
        
    # Загружаем последние 50 детекций
    results = query.order_by(Detection.timestamp.desc()).limit(50).all()
    
    return jsonify([{
        'id': d.id,
        'camera_id': d.camera_id,
        'confidence': d.confidence,
        'lat': float(d.lat) if d.lat else None,
        'lng': float(d.lng) if d.lng else None,
        'timestamp': d.timestamp.isoformat()
    } for d in results]), 200

@sightings_bp.route('/detections', methods=['POST'])
def add_detection():
    """Эндпоинт для AI-скрипта камеры: отправка данных о найденном лице."""
    data = request.get_json()
    
    try:
        new_detection = Detection(
            camera_id=data.get('camera_id'),
            confidence=data.get('confidence'),
            appearance_data=data.get('appearance_data'), # Наш крутой JSON
            lat=data.get('lat'),
            lng=data.get('lng')
        )
        db.session.add(new_detection)
        db.session.commit()
        return jsonify({'message': 'Detection logged', 'id': new_detection.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
