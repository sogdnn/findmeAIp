import os
import uuid
from typing import Tuple
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from database import db, MissingCase
from face_engine import get_face_embedding

cases_bp = Blueprint('cases', __name__)

# Константы
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file: FileStorage) -> str:
    """Сохраняет файл с уникальным именем и возвращает путь."""
    extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    
    upload_path = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
        
    filepath = os.path.join(upload_path, unique_filename)
    file.save(filepath)
    return unique_filename

@cases_bp.route('/cases', methods=['GET'])
def get_cases():
    """Получение списка дел с фильтрацией по статусу."""
    status = request.args.get('status')
    try:
        query = MissingCase.query
        if status:
            query = query.filter_by(status=status)
        
        cases = query.order_by(MissingCase.created_at.desc()).all()
        return jsonify([c.to_dict() for c in cases]), 200
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@cases_bp.route('/cases/<int:case_id>', methods=['GET'])
def get_case(case_id: int):
    """Получение детальной информации о конкретном деле."""
    case = MissingCase.query.get_or_404(case_id)
    data = case.to_dict()
    # Добавляем связанные совпадения, если они есть
    data['matches'] = [m.to_dict() for m in getattr(case, 'matches', [])]
    return jsonify(data), 200

@cases_bp.route('/cases', methods=['POST'])
def create_case():
    """Создание нового дела о пропавшем человеке."""
    # Валидация обязательных полей
    name = request.form.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    photo_url = None
    face_vector = None

    # Обработка фото
    if 'photo' in request.files:
        file = request.files['photo']
        if file and allowed_file(file.filename):
            try:
                filename = save_image(file)
                photo_url = f'/uploads/{filename}'
                
                # Получаем путь для face_engine
                full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                face_vector = get_face_embedding(full_path)
            except Exception as e:
                return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

    try:
        new_case = MissingCase(
            full_name=name,
            age=request.form.get('age', type=int),
            last_seen_location=request.form.get('location'),
            description=request.form.get('description'),
            photo_url=photo_url,
            lat=request.form.get('lat', type=float),
            lng=request.form.get('lng', type=float),
            face_vector=face_vector,
            reporter_name=request.form.get('reporter_name'),
            reporter_contact=request.form.get('reporter_contact'),
            status='searching'
        )
        
        db.session.add(new_case)
        db.session.commit()
        return jsonify(new_case.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

@cases_bp.route('/cases/<int:case_id>', methods=['PATCH'])
def update_case(case_id: int):
    """Обновление статуса дела."""
    case = MissingCase.query.get_or_404(case_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'status' in data:
        case.status = data['status']
    
    try:
        db.session.commit()
        return jsonify(case.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500
