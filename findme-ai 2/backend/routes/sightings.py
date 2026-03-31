from flask import Blueprint, request, jsonify, current_app
from database import db, Sighting, MissingCase, Match
from face_engine import get_face_embedding, cosine_similarity
import os
from werkzeug.utils import secure_filename

sightings_bp = Blueprint('sightings', __name__)

MATCH_THRESHOLD = 85.0  # Ұқсастық шегі (%)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@sightings_bp.route('/sightings', methods=['GET'])
def get_sightings():
    sightings = Sighting.query.order_by(Sighting.timestamp.desc()).all()
    return jsonify([s.to_dict() for s in sightings])


@sightings_bp.route('/sightings', methods=['POST'])
def create_sighting():
    location_lat = request.form.get('lat')
    location_lng = request.form.get('lng')
    location_name = request.form.get('location_name')
    reporter_name = request.form.get('reporter_name')
    reporter_contact = request.form.get('reporter_contact')
    notes = request.form.get('notes')

    if 'photo' not in request.files:
        return jsonify({'error': 'Photo is required'}), 400

    file = request.files['photo']
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(f"sighting_{file.filename}")
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # AI: бет векторын алу
    face_vector = get_face_embedding(filepath)

    new_sighting = Sighting(
        image_path=f'/uploads/{filename}',
        location_lat=float(location_lat) if location_lat else None,
        location_lng=float(location_lng) if location_lng else None,
        location_name=location_name,
        reporter_name=reporter_name,
        reporter_contact=reporter_contact,
        notes=notes,
        face_vector=face_vector
    )
    db.session.add(new_sighting)
    db.session.flush()  # ID алу үшін

    matches_found = []

    # ─── Векторлық іздеу ─────────────────────────────────────────────────
    if face_vector is not None:
        # Барлық активті кейстерден ең ұқсасын іздеу
        active_cases = MissingCase.query.filter_by(status='active').all()

        for case in active_cases:
            if case.face_vector is None:
                continue
            similarity = cosine_similarity(face_vector, list(case.face_vector))

            if similarity >= MATCH_THRESHOLD:
                match = Match(
                    case_id=case.id,
                    sighting_id=new_sighting.id,
                    similarity_score=round(similarity, 2),
                    status='pending'
                )
                db.session.add(match)
                matches_found.append({
                    'case_id': case.id,
                    'case_name': case.full_name,
                    'similarity': round(similarity, 2)
                })

    db.session.commit()

    return jsonify({
        'sighting': new_sighting.to_dict(),
        'matches_found': len(matches_found),
        'matches': matches_found
    }), 201
