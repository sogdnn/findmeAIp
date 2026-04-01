from flask import Flask
from database import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+mysqlconnector://root:password@localhost/findme_ai_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализируем базу
db.init_app(app)

# Проверка связи
with app.app_context():
    try:
        db.engine.connect()
        print("--- СВЯЗЬ С MYSQL УСТАНОВЛЕНА, СЭР! ---")
    except Exception as e:
        print(f"--- ОШИБКА ПОДКЛЮЧЕНИЯ: {e} ---")
