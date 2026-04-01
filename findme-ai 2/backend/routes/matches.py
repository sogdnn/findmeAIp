from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from database import db, Match, MissingCase, Sighting

matches_bp = Blueprint('matches', __name__)

# Список разрешенных статусов для валидации
VALID_MATCH_STATUSES = {'pending', 'confirmed', 'rejected'}

@matches_bp.route('/matches', methods=['GET'])
def get_matches():
    """
    Получение списка совпадений с оптимизированной загрузкой данных.
    """
    try:
        status = request.args.get('status')
        case_id = request.args.get('case_id', type=int)

        # Используем options(joinedload), чтобы сразу подтянуть данные о кейсе за 1 запрос
        query = Match.query.options(joinedload(Match.case))
        
        if status:
            if status in VALID_MATCH_STATUSES:
                query = query.filter_by(status=status)
        
        if case_id:
            query = query.filter_by(case_id=case_id)

        # Сортируем по самому высокому проценту сходства (similarity_score)
        matches = query.order_by(Match.similarity_score.desc()).all()
        
        return jsonify([m.to_dict() for m in matches]), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch matches', 'details': str(e)}), 500


@matches_bp.route('/matches/<int:match_id>', methods=['PATCH'])
def update_match(match_id):
    """
    Обновление статуса совпадения и автоматическое обновление статуса дела.
    """
    match = Match.query.get_or_404(match_id)
    data = request.get_json()

    if not data or 'status' not in data:
        return jsonify({'error': 'Status field is required'}), 400

    new_status = data['status']
    if new_status not in VALID_MATCH_STATUSES:
        return jsonify({'error': f'Invalid status. Choose from: {VALID_MATCH_STATUSES}'}), 400

    try:
        match.status = new_status
        
        # Бизнес-логика: если совпадение подтверждено, закрываем дело
        if new_status == 'confirmed':
            case = MissingCase.query.get(match.case_id)
            if case:
                case.status = 'found'
                # Можно также отклонить все остальные "pending" совпадения для этого дела
                # Match.query.filter_by(case_id=case.id, status='pending').update({'status': 'rejected'})

        db.session.commit()
        return jsonify(match.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Transaction failed', 'details': str(e)}), 500


@matches_bp.route('/matches/stats', methods=['GET'])
def get_stats():
    """
    Сбор глобальной статистики по системе.
    """
    try:
        stats = {
            'total_cases': MissingCase.query.count(),
            'active_cases': MissingCase.query.filter_by(status='searching').count(), # Убедись, что статус совпадает с фронтом
            'found_cases': MissingCase.query.filter_by(status='found').count(),
            'total_sightings': Sighting.query.count(),
            'pending_matches': Match.query.filter_by(status='pending').count(),
            'confirmed_matches': Match.query.filter_by(status='confirmed').count()
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': 'Could not calculate statistics', 'details': str(e)}), 500
