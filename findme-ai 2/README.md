# FindMe AI 🔍
### AI арқылы жоғалған адамдарды іздеу платформасы

> Фотоны жүктеңіз — AI базадағы барлық кейстермен секундтар ішінде салыстырады.

---

## 📁 Жоба құрылымы

```
findme-ai/
├── backend/
│   ├── app.py                  ← Flask негізгі сервер
│   ├── database.py             ← SQLAlchemy моделдері (pgvector қосылған)
│   ├── face_engine.py          ← AI бет салыстыру (DeepFace / OpenCV fallback)
│   ├── requirements.txt        ← Python тәуелділіктер
│   ├── .env.example            ← Конфигурация үлгісі
│   └── routes/
│       ├── cases.py            ← POST/GET /api/cases
│       ├── sightings.py        ← POST/GET /api/sightings (AI іске қосады)
│       └── matches.py          ← GET/PATCH /api/matches + статистика
│
└── frontend/
    ├── public/index.html
    ├── package.json
    └── src/
        ├── App.jsx             ← Router + navbar
        ├── index.js            ← React кіру нүктесі
        ├── index.css           ← Дизайн жүйесі (dark theme)
        ├── utils/
        │   ├── api.js          ← Flask-ке барлық API сұраныстар
        │   └── firebase.js     ← Firebase Auth (Google кіру)
        └── pages/
            ├── HomePage.jsx        ← Статистика + соңғы кейстер
            ├── ReportPage.jsx      ← Жоғалған адамды хабарлау
            ├── SightingPage.jsx    ← Байқалды деп хабарлау (AI іске қосады)
            ├── CasesPage.jsx       ← Барлық кейстер + іздеу/сүзгі
            ├── CaseDetailPage.jsx  ← Жеке кейс + AI сәйкестіктер
            └── MatchesPage.jsx     ← Барлық сәйкестіктер + растау панелі
```

---

## ⚙️ Орнату

### Алдын ала қажетті бағдарламалар
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (pgvector кеңейтілімімен)

---

### 1️⃣ PostgreSQL орнату (Docker — ең оңай жол)

```bash
docker run --name findme-db \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -d ankane/pgvector
```

Немесе PostgreSQL-ді қолмен орнатып, pgvector extension қосыңыз:
```sql
CREATE DATABASE findme_db;
\c findme_db
CREATE EXTENSION vector;
```

---

### 2️⃣ Backend орнату

```bash
cd findme-ai/backend

# Виртуалды орта
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Тәуелділіктерді орнату
pip install -r requirements.txt
```

> **Ескерту:** DeepFace + TensorFlow орнату 5-10 минут алуы мүмкін.
> Жылдам демо үшін `requirements.txt` ішінен `deepface` пен `tf-keras` жолдарын
> комментке алып тастаңыз — OpenCV fallback автоматты іске қосылады.

**Минималды орнату (демо режим):**
```bash
pip install flask flask-cors flask-sqlalchemy psycopg2-binary pgvector werkzeug numpy opencv-python-headless python-dotenv
```

**Конфигурация:**
```bash
# .env.example файлын көшіріп, деректерді толтырыңыз
cp .env.example .env
```

`.env` файлын редакторда ашып, `DATABASE_URL` мәнін өзіңіздің PostgreSQL деректерімен ауыстырыңыз.

---

### 3️⃣ Frontend орнату

```bash
cd findme-ai/frontend
npm install
```

---

## 🚀 Іске қосу

### Backend (1-терминал)

```bash
cd findme-ai/backend
# Windows: .\venv\Scripts\activate
source venv/bin/activate
python app.py
```

Backend → **http://localhost:5000**

### Frontend (2-терминал)

```bash
cd findme-ai/frontend
npm start
```

Frontend → **http://localhost:3000**

React барлық `/api` сұраныстарын Flask-ке автоматты жібереді.

---

## 🔌 API сілтемелері

| Метод  | Эндпоинт               | Сипаттамасы                            |
|--------|------------------------|----------------------------------------|
| GET    | /api/health            | Серверді тексеру                       |
| POST   | /api/cases             | Жаңа кейс ашу (фото + AI вектор)      |
| GET    | /api/cases             | Барлық кейстер тізімі                 |
| GET    | /api/cases/:id         | Кейс + оның сәйкестіктері             |
| PATCH  | /api/cases/:id         | Статусты өзгерту (active/found)       |
| POST   | /api/sightings         | Байқалды жүктеу → AI іздеу            |
| GET    | /api/sightings         | Барлық байқалулар                     |
| GET    | /api/matches           | Сәйкестіктер тізімі (сүзгілеуге болады) |
| PATCH  | /api/matches/:id       | Растау / Өтірік деп белгілеу          |
| GET    | /api/matches/stats     | Жалпы статистика                      |

---

## 🤖 AI Бет Салыстыру

```python
from face_engine import compare_faces

result = compare_faces('path/to/missing.jpg', 'path/to/sighting.jpg')
# {
#   'similarity': 91.4,           # 0–100%
#   'is_match': True,             # similarity >= 85%
#   'model': 'DeepFace/ArcFace',
#   'error': None
# }
```

**Модель иерархиясы:**
1. **DeepFace + ArcFace** (негізгі) — заманауи бет тану
2. **OpenCV Histogram** (запас) — GPU-сіз жұмыс істейді

**Сәйкестік шегі:** 85% (`routes/sightings.py` ішінде өзгертуге болады)

**pgvector іздеуі:**
Әрбір фото 512 өлшемді векторға айналдырылып базада сақталады.
Cosine Distance алгоритмі миллиондаған векторды миллисекундтарда салыстырады.

---

## 🗺️ Мүмкіндіктер

- ✅ Жоғалған адамды фото + координатамен хабарлау
- ✅ Публикалық байқалу хабарламасы
- ✅ Жүктелген сайын автоматты AI салыстыру
- ✅ Ұқсастық пайызы + визуалды прогресс-бар
- ✅ Сәйкестікті растау/жоққа шығару жұмыс процесі
- ✅ Кейс статусын бақылау (active → found)
- ✅ pgvector арқылы жылдам векторлық іздеу
- ✅ DeepFace болмаса OpenCV-ге автоматты ауысу
- ✅ REST API + PostgreSQL

---

## 🔧 Конфигурация

| Параметр        | Орны                      | Дефолт                |
|-----------------|---------------------------|-----------------------|
| Match threshold | `routes/sightings.py`     | 85%                   |
| Max upload size | `app.py`                  | 16 MB                 |
| AI model        | `face_engine.py`          | ArcFace               |
| Database URL    | `.env`                    | localhost/findme_db   |

---

## 📜 Лицензия

MIT — мәнді нәрсе жасаңыз.
