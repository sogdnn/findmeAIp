import numpy as np
import os

# DeepFace орнатылған болса қолданамыз, болмаса OpenCV fallback
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("[AI Engine] DeepFace loaded successfully ✓")
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("[AI Engine] DeepFace not found, using OpenCV fallback")

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    print("[AI Engine] WARNING: OpenCV not found either!")


def get_face_embedding(image_path: str):
    """
    Фотодан 512 өлшемді вектор шығару.
    DeepFace (ArcFace) → OpenCV fallback реті бойынша жұмыс істейді.
    """
    if not os.path.exists(image_path):
        print(f"[AI Engine] File not found: {image_path}")
        return None

    if DEEPFACE_AVAILABLE:
        return _deepface_embedding(image_path)
    elif OPENCV_AVAILABLE:
        return _opencv_embedding(image_path)
    else:
        print("[AI Engine] No AI engine available!")
        return None


def _deepface_embedding(image_path: str):
    """DeepFace + ArcFace арқылы 512-өлшемді вектор"""
    try:
        embedding_objs = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            enforce_detection=False,
            detector_backend="retinaface"
        )
        if embedding_objs:
            return embedding_objs[0]["embedding"]
        return None
    except Exception as e:
        print(f"[DeepFace] Error: {e}")
        # Fallback to OpenCV
        if OPENCV_AVAILABLE:
            return _opencv_embedding(image_path)
        return None


def _opencv_embedding(image_path: str):
    """
    OpenCV Histogram — жеңіл fallback.
    512 нүктелік вектор шығарады (4 канал × 128 bin).
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        img = cv2.resize(img, (256, 256))
        # BGR + HSV каналдарынан гистограмма
        hist_b = cv2.calcHist([img], [0], None, [128], [0, 256]).flatten()
        hist_g = cv2.calcHist([img], [1], None, [128], [0, 256]).flatten()
        hist_r = cv2.calcHist([img], [2], None, [128], [0, 256]).flatten()
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        hist_h = cv2.calcHist([hsv], [0], None, [128], [0, 180]).flatten()

        combined = np.concatenate([hist_b, hist_g, hist_r, hist_h])
        # Нормализация
        norm = np.linalg.norm(combined)
        if norm > 0:
            combined = combined / norm
        return combined.tolist()
    except Exception as e:
        print(f"[OpenCV] Error: {e}")
        return None


def cosine_similarity(vec1, vec2):
    """Екі вектор арасындағы ұқсастықты есептеу (0-100%)"""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    dot = np.dot(v1, v2)
    norm = np.linalg.norm(v1) * np.linalg.norm(v2)
    if norm == 0:
        return 0.0
    similarity = dot / norm
    # -1..1 → 0..100
    return float((similarity + 1) / 2 * 100)


def compare_faces(path1: str, path2: str):
    """
    Екі фотоны салыстырып, ұқсастық пайызын қайтару.
    Мысал: {'similarity': 91.4, 'is_match': True, 'model': 'ArcFace'}
    """
    vec1 = get_face_embedding(path1)
    vec2 = get_face_embedding(path2)

    if vec1 is None or vec2 is None:
        return {'similarity': 0, 'is_match': False, 'error': 'Face not detected'}

    similarity = cosine_similarity(vec1, vec2)
    model_name = "DeepFace/ArcFace" if DEEPFACE_AVAILABLE else "OpenCV/Histogram"

    return {
        'similarity': round(similarity, 2),
        'is_match': similarity >= 85.0,
        'model': model_name,
        'error': None
    }
