from flask import Flask
from flask_cors import CORS
from database import db
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # ─── Configuration ───────────────────────────────────────────────────────
    # .env файлынан немесе дефолт мәндерден алу
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:password@localhost:5432/findme_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # Суреттер сақталатын папка
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # ─── DB Init ─────────────────────────────────────────────────────────────
    db.init_app(app)

    with app.app_context():
        # pgvector extension (тек PostgreSQL)
        try:
            db.session.execute(db.text('CREATE EXTENSION IF NOT EXISTS vector'))
            db.session.commit()
        except Exception as e:
            print(f"pgvector extension note: {e}")
        db.create_all()

    # ─── Routes ──────────────────────────────────────────────────────────────
    from routes.cases import cases_bp
    from routes.sightings import sightings_bp
    from routes.matches import matches_bp

    app.register_blueprint(cases_bp, url_prefix='/api')
    app.register_blueprint(sightings_bp, url_prefix='/api')
    app.register_blueprint(matches_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'FindMe AI is running 🔍'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
