from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt
from datetime import datetime, timedelta
from newspaper import Article
from transformers import pipeline
import spacy
import traceback

# Load spaCy and BART models
nlp = spacy.load("en_core_web_sm")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# JWT Secret
SECRET_KEY = "your_super_secret_key"

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client['chatbot_db']
users = db['users']
history_collection = db['history']

# ----------------- SIGNUP -----------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users.find_one({'email': email}):
        return jsonify({'error': 'Email already exists'}), 400

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    users.insert_one({'name': name, 'email': email, 'password': hashed})

    return jsonify({'message': 'Signup successful'}), 200

# ----------------- LOGIN -----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users.find_one({'email': email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode(
        {'email': email, 'exp': datetime.utcnow() + timedelta(hours=12)},
        SECRET_KEY,
        algorithm='HS256'
    )

    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return jsonify({
        'token': token,
        'user': {'name': user['name'], 'email': user['email']}
    }), 200

# ----------------- TOKEN VALIDATION -----------------
def get_email_from_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Missing or invalid auth header'

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('email'), None
    except jwt.ExpiredSignatureError:
        return None, 'Token expired'
    except jwt.InvalidTokenError:
        return None, 'Invalid token'

# ----------------- EXTRACTIVE SUMMARY (spaCy) -----------------
def extractive_summary_spacy(text, sentence_count=7):
    doc = nlp(text)
    sentences = list(doc.sents)

    # Rank sentences by number of named entities and nouns
    ranked = sorted(sentences, key=lambda s: sum(1 for token in s if token.pos_ in ['NOUN', 'PROPN']), reverse=True)
    top_sentences = sorted(ranked[:sentence_count], key=lambda s: s.start)  # keep original order
    return " ".join(str(s).strip() for s in top_sentences)

# ----------------- SUMMARIZE -----------------
@app.route('/summarize', methods=['POST'])
def summarize():
    email, error = get_email_from_token(request.headers.get('Authorization'))
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        print(f"Downloading article: {url}")
        article = Article(url)
        article.download()
        article.parse()
        article_text = article.text
        article_title = article.title or "Untitled"

        if not article_text.strip():
            raise ValueError("Article content is empty")

        print("Extracting key sentences using spaCy...")
        extracted_text = extractive_summary_spacy(article_text, sentence_count=7)

        print("Performing abstractive summarization...")
        output = summarizer(extracted_text, max_length=200, min_length=60, do_sample=False)
        summary_text = output[0]['summary_text']

    except Exception as e:
        print("Error during summarization:")
        traceback.print_exc()
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

    print(f"Saving summary for {email}")
    history_collection.insert_one({
        "email": email,
        "url": url,
        "title": article_title,
        "summary": summary_text,
        "timestamp": datetime.now().isoformat()
    })

    return jsonify({
        "summary": summary_text,
        "title": article_title
    }), 200

# ----------------- HISTORY -----------------
@app.route('/history', methods=['GET'])
def history():
    email, error = get_email_from_token(request.headers.get('Authorization'))
    if error:
        return jsonify({'error': error}), 401

    print(f"Fetching history for: {email}")
    summaries = list(history_collection.find({"email": email}, {"_id": 0}))
    return jsonify({"summaries": summaries}), 200

# ----------------- MAIN -----------------
if __name__ == '__main__':
    print("Server running at http://localhost:5000")
    app.run(debug=True, port=5000, use_reloader=False)
