from flask import Blueprint, request, jsonify
from database import db, Match, MissingCase

matches_bp = Blueprint('matches', __name__)


@matches_bp.route('/matches', methods=['GET'])
def get_matches():
    status = request.args.get('status')
    case_id = request.args.get('case_id')

    query = Match.query
    if status:
        query = query.filter_by(status=status)
    if case_id:
        query = query.filter_by(case_id=case_id)

    matches = query.order_by(Match.similarity_score.desc()).all()
    return jsonify([m.to_dict() for m in matches])


@matches_bp.route('/matches/<int:match_id>', methods=['PATCH'])
def update_match(match_id):
    match = Match.query.get_or_404(match_id)
    data = request.get_json()

    if 'status' in data:
        match.status = data['status']
        # Егер Match "confirmed" болса, кейсті "found" деп белгілейміз
        if data['status'] == 'confirmed':
            case = MissingCase.query.get(match.case_id)
            if case:
                case.status = 'found'

    db.session.commit()
    return jsonify(match.to_dict())


@matches_bp.route('/matches/stats', methods=['GET'])
def get_stats():
    from database import MissingCase, Sighting
    total_cases = MissingCase.query.count()
    active_cases = MissingCase.query.filter_by(status='active').count()
    found_cases = MissingCase.query.filter_by(status='found').count()
    total_sightings = Sighting.query.count()
    pending_matches = Match.query.filter_by(status='pending').count()
    confirmed_matches = Match.query.filter_by(status='confirmed').count()

    return jsonify({
        'total_cases': total_cases,
        'active_cases': active_cases,
        'found_cases': found_cases,
        'total_sightings': total_sightings,
        'pending_matches': pending_matches,
        'confirmed_matches': confirmed_matches
    })
