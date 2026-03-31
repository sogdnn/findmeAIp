from flask import Blueprint, request, jsonify, current_app
from database import db, MissingCase
from face_engine import get_face_embedding
import os
from werkzeug.utils import secure_filename

cases_bp = Blueprint('cases', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@cases_bp.route('/cases', methods=['GET'])
def get_cases():
    status = request.args.get('status')
    query = MissingCase.query
    if status:
        query = query.filter_by(status=status)
    cases = query.order_by(MissingCase.created_at.desc()).all()
    return jsonify([c.to_dict() for c in cases])


@cases_bp.route('/cases/<int:case_id>', methods=['GET'])
def get_case(case_id):
    case = MissingCase.query.get_or_404(case_id)
    data = case.to_dict()
    data['matches'] = [m.to_dict() for m in case.matches]
    return jsonify(data)


@cases_bp.route('/cases', methods=['POST'])
def create_case():
    # Form data алу
    name = request.form.get('name')
    age = request.form.get('age')
    location = request.form.get('location')
    description = request.form.get('description')
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    reporter_name = request.form.get('reporter_name')
    reporter_contact = request.form.get('reporter_contact')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    photo_url = None
    face_vector = None

    if 'photo' in request.files:
        file = request.files['photo']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            photo_url = f'/uploads/{filename}'
            # AI: бет векторын алу
            face_vector = get_face_embedding(filepath)

    new_case = MissingCase(
        full_name=name,
        age=int(age) if age else None,
        last_seen_location=location,
        description=description,
        photo_url=photo_url,
        lat=float(lat) if lat else None,
        lng=float(lng) if lng else None,
        face_vector=face_vector,
        reporter_name=reporter_name,
        reporter_contact=reporter_contact
    )
    db.session.add(new_case)
    db.session.commit()
    return jsonify(new_case.to_dict()), 201


@cases_bp.route('/cases/<int:case_id>', methods=['PATCH'])
def update_case(case_id):
    case = MissingCase.query.get_or_404(case_id)
    data = request.get_json()
    if 'status' in data:
        case.status = data['status']
    db.session.commit()
    return jsonify(case.to_dict())
