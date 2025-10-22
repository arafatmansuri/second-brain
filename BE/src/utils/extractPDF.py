import boto3
import os
from io import BytesIO
import fitz
import json
import sys
from dotenv import load_dotenv

load_dotenv()
def extract_pdf_form_key(key):
    bucket_name = os.getenv("AWS_BUCKET_NAME")

    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"))

    pdf_stream = BytesIO()
    s3.download_fileobj(bucket_name, key, pdf_stream)

    docs = []
    pdf_stream.seek(0)
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
    key = sys.argv[1]
    docs = extract_pdf_form_key(key)
    print(json.dumps(docs))