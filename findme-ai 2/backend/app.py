from flask import Flask
from flask_cors import CORSMiddleware
from database import db
from routes import cases_bp, matches_bp, sightings_bp

def create_app():
    app = Flask(__name__)
    
    # Настройки безопасности (CORS)
    CORSMiddleware(app)

    # --- НАСТРОЙКА MYSQL ---
    # Замени 'root:password' на свои данные
    app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+mysqlconnector://root:password@localhost/findme_ai_db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Инициализация БД
    db.init_app(app)

    # Регистрация сильных маршрутов
    app.register_blueprint(cases_bp, url_prefix='/api')
    app.register_blueprint(matches_bp, url_prefix='/api')
    app.register_blueprint(sightings_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=8000)
