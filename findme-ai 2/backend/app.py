from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import FindMeDatabase
import uuid

app = FastAPI()

# Разрешаем фронтенду подключаться
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db = FindMeDatabase(host="localhost", user="root", password="your_password", database="findme_ai_db")

class SearchAttributes(BaseModel):
    gender: str
    hair_color: str
    clothing_upper: str

@app.post("/api/v1/register")
async def register(data: SearchAttributes):
    # Логика сохранения характеристик в JSON
    person_id = db.create_person_with_attributes(
        user_id="user_123", 
        char_data={"gender": data.gender, "hair": {"color": data.hair_color}},
        clothing_data={"upper": data.clothing_upper}
    )
    return {"person_id": person_id}

@app.post("/api/v1/search/face")
async def search_face(file: UploadFile = File(...)):
    # Здесь твоя нейронка обрабатывает файл
    # Возвращаем имитацию для теста связи
    return {
        "matches": [
            {"person_id": str(uuid.uuid4()), "confidence": 0.95},
            {"person_id": str(uuid.uuid4()), "confidence": 0.82}
        ]
    }
