import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

app = Flask(__name__)

CORS(app)  # Allows your frontend (running on a different port) to talk to this backend

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecotrack.db')


# ===== DATABASE SETUP =====
def init_db():
    """Creates the database tables if they don't already exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            user_id INTEGER PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            challenges_completed INTEGER DEFAULT 0,
            calculators_used INTEGER DEFAULT 0,
            streak INTEGER DEFAULT 0,
            last_challenge_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()


def hash_password(password):
    """Turns a plain password into a secure hash before storing it.
    We never store real passwords in the database."""
    return hashlib.sha256(password.encode()).hexdigest()


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name
    return conn


# ===== ROUTES =====

@app.route('/')
def home():
    return jsonify({"message": "EcoTrack AI backend is running."})


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    existing = cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "An account with this email already exists."}), 409

    password_hash = hash_password(password)
    cursor.execute(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        (name, email, password_hash)
    )
    user_id = cursor.lastrowid

    cursor.execute('INSERT INTO user_stats (user_id) VALUES (?)', (user_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Account created successfully.", "user_id": user_id}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or user['password_hash'] != hash_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful.",
        "user_id": user['id'],
        "name": user['name'],
        "email": user['email']
    }), 200


@app.route('/api/stats/<int:user_id>', methods=['GET'])
def get_stats(user_id):
    conn = get_db_connection()
    stats = conn.execute('SELECT * FROM user_stats WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()

    if not stats:
        return jsonify({"error": "User stats not found."}), 404

    return jsonify(dict(stats)), 200


@app.route('/api/stats/<int:user_id>', methods=['PUT'])
def update_stats(user_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE user_stats
        SET xp = ?, challenges_completed = ?, calculators_used = ?, streak = ?, last_challenge_date = ?
        WHERE user_id = ?
    ''', (
        data.get('xp', 0),
        data.get('challenges_completed', 0),
        data.get('calculators_used', 0),
        data.get('streak', 0),
        data.get('last_challenge_date'),
        user_id
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Stats updated successfully."}), 200


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    try:
        system_instruction = (
            "You are EcoBot, a friendly AI assistant inside the EcoTrack AI app. "
            "You help users reduce their carbon footprint, live more sustainably, "
            "and understand their eco stats. Keep answers short, practical, and "
            "encouraging. Use simple language and occasional emojis (🌱♻️🌍)."
        )
        response = gemini_client.models.generate_content(
            model="gemini-flash-latest",
            contents=user_message,
            config={
                "system_instruction": system_instruction,
                "max_output_tokens": 300,
                "thinking_config": {"thinking_budget": 0}
            }
        )
        return jsonify({'reply': response.text})
    except Exception as e:
        print('Chat error:', e)
        return jsonify({'error': 'Could not reach AI assistant. Try again.'}), 500


@app.route('/api/classify-waste', methods=['POST'])
def classify_waste():
    try:
        data = request.get_json()
        image_base64 = data.get('image')

        if not image_base64:
            return jsonify({"error": "No image provided"}), 400

        mime_type = "image/jpeg"
        if image_base64.startswith('data:') and ',' in image_base64:
            header = image_base64.split(',')[0]
            mime_type = header.split(':')[1].split(';')[0]
            image_base64 = image_base64.split(',')[1]

        image_bytes = base64.b64decode(image_base64)

        # # DEBUG PRINTS
        # print("Mime type detected:", mime_type)
        # print("Image bytes length:", len(image_bytes))
        # print("First 20 bytes:", image_bytes[:20])

        prompt = """You are a waste sorting assistant. Look at this image and identify the main waste item.
        Respond ONLY in this exact JSON format, no extra text:
        {
          "item": "name of item",
          "category": "Recyclable" or "Organic" or "Hazardous" or "General Waste",
          "tip": "one short sentence on how to dispose of it properly"
        }"""

        response = gemini_client.models.generate_content(
            model="gemini-flash-latest",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config={
                "max_output_tokens": 300
            }
        )

        result_text = response.text.strip()
        result_text = result_text.replace("```json", "").replace("```", "").strip()

        return jsonify({"result": result_text})

    except Exception as e:
        print('Classify error:', e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
