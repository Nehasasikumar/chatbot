from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def generate_summary(text):
    chunks = [text[i:i+1024] for i in range(0, len(text), 1024)][:3]

    summary = ""
    for i, chunk in enumerate(chunks):
        print(f"Abstractive chunk {i+1}/{len(chunks)}")
        result = summarizer(chunk, max_length=150, min_length=40, do_sample=False)
        summary += result[0]['summary_text'] + " "
    return summary.strip()
