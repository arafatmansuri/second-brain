import fitz
import json
import sys
import requests
from io import BytesIO

def extract_pdf_from_url(url):
    # Download PDF in memory
    res = requests.get(url)
    res.raise_for_status()
    pdf_stream = BytesIO(res.content)

    docs = []
    with fitz.open(stream=pdf_stream, filetype="pdf") as pdf:
        meta = pdf.metadata
        for i, page in enumerate(pdf, start=1):
            text = page.get_text("text")
            if len(text.split()) > 20:
                docs.append({
                    "text": text,
                    "metadata": {
                    "page": i,
                    "page_label": page.get_label() or str(i),
                    # "total_pages": meta.get("total_pages",0),
                    # "source": meta.get("source",""),
                    "title": meta.get("title", ""),
                    "author": meta.get("author", ""),
                    "creator": meta.get("creator", ""),
                    "producer": meta.get("producer", ""),
                    "creationdate": meta.get("creationDate", ""),
                    "moddate": meta.get("modDate", "")
                    }
                })
    return docs

if __name__ == "__main__":
    pdf_url = sys.argv[1]
    docs = extract_pdf_from_url(pdf_url)
    print(json.dumps(docs))
