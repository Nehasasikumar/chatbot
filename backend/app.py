from flask import Flask, request, jsonify
from newspaper import Article
from flask_cors import CORS
from summarizer import Summarizer
from abstractive_summarizer import generate_summary
from history_store import save_history, get_history

app = Flask(__name__)
CORS(app)

extractive_summarizer = Summarizer()

@app.route('/summarize', methods=['POST'])
def summarize():
    print("📩 Received /summarize request")

    try:
        data = request.get_json()
        url = data.get("url", "")
        print(f"🔗 URL Received: {url}")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        print("🌐 Downloading article...")
        article = Article(url)

        try:
            article.download()
            article.parse()
        except Exception as e:
            print(f"❌ Download/parsing error: {e}")
            return jsonify({"error": "Article could not be fetched."}), 500

        text = article.text
        images = list(article.images)

        if len(text.strip()) == 0:
            return jsonify({"error": "Article has no readable content."}), 400

        print("✂️ Extractive summarization...")
        chunk_size = 1000
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)][:5]

        extractive_summary = ""
        for i, chunk in enumerate(chunks):
            print(f"🧩 Extractive chunk {i+1}/{len(chunks)}...")
            try:
                summary_piece = ''.join(extractive_summarizer(chunk, min_length=60))
                extractive_summary += summary_piece + " "
            except Exception as e:
                print(f"❌ Extractive failed for chunk {i+1}: {e}")
                extractive_summary += "[Failed chunk] "

        print("🧠 Abstractive summarization...")
        try:
            abstractive_summary = generate_summary(text)
        except Exception as e:
            print(f"❌ Abstractive summarization failed: {e}")
            abstractive_summary = "Abstractive summarization failed."

        response_payload = {
            "extractive_summary": extractive_summary.strip(),
            "abstractive_summary": abstractive_summary.strip(),
            "title": article.title or "Untitled Article",
            "images": images,
            "summary_id": url
        }

        save_history(url, article.title or "Untitled Article", abstractive_summary)

        print("✅ Returning summary response.")
        return jsonify(response_payload)

    except Exception as e:
        print("🔥 Unexpected server error:", e)
        return jsonify({"error": "Unexpected error occurred."}), 500

@app.route('/history', methods=['GET'])
def history():
    try:
        print("📚 Fetching saved summaries...")
        return jsonify({"summaries": get_history()})
    except Exception as e:
        print("❌ History load failed:", e)
        return jsonify({"summaries": []})

if __name__ == '__main__':
    print("🚀 Backend is starting...")
    app.run(debug=True)
