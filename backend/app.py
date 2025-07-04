from flask import Flask, request, jsonify
from newspaper import Article
from summarizer import generate_summary
from history_store import save_history, get_history
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests from different origin

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    url = data.get("url", "")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        article = Article(url)
        article.download()
        article.parse()
        text = article.text

        if len(text.strip()) == 0:
            return jsonify({"error": "Article has no content"}), 400

        summary = generate_summary(text)
        print(f"✅ Summary for URL: {url}\n{summary}\n{'-'*80}")  # Debug: print summary
        save_history(url, summary)
        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    return jsonify(get_history())

if __name__ == '__main__':
    app.run(debug=True)