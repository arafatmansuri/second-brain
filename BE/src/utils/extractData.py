import boto3
import os
from io import BytesIO
import fitz
import json
import sys
from dotenv import load_dotenv

load_dotenv()
def extract_pdf_form_key(key:str):
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

from youtube_transcript_api import YouTubeTranscriptApi

def chunk_by_duration(transcript,metadata):
        chunks = []
        current_chunk = {"data": "", "start": None, "end": None, "duration": 0.0}
        max_chunk_duration = 60;
        for entry in transcript:
            text = entry["text"].strip()
            start = entry["start"]
            duration = entry["duration"]
            end = start + duration

            # Initialize the first chunk
            if current_chunk["start"] is None:
                current_chunk["start"] = start

            # Check if adding this entry exceeds max duration
            if current_chunk["duration"] + duration <= max_chunk_duration:
                current_chunk["data"] += " " + text
                current_chunk["end"] = end
                current_chunk["duration"] += duration
            else:
                # Save current chunk and start a new one
                chunks.append({
                    "data": current_chunk["data"].strip(),
                    "start": current_chunk["start"],
                    "end": current_chunk["end"],
                    "videoTitle":metadata["title"],
                    "description":metadata["description"],
                    "staticstics":metadata["staticstics"],
                    "duration":metadata["duration"],
                    "channelName":metadata["channelName"],
                })

                current_chunk = {
                    "data": text,
                    "start": start,
                    "end": end,
                    "duration": duration
                }

        # Add the last chunk
        if current_chunk["data"]:
            chunks.append({
                "data": current_chunk["data"].strip(),
                "start": current_chunk["start"],
                "end": current_chunk["end"],
                "videoTitle":metadata["title"],
                "description":metadata["description"],
                "staticstics":metadata["staticstics"],
                "duration":metadata["duration"],
                "channelName":metadata["channelName"],
            })

        return chunks

def fetch_transcript(video_id:str,metadata):

    transcript = YouTubeTranscriptApi().fetch(video_id)
    chunks = chunk_by_duration(transcript.to_raw_data(),metadata)
    return chunks

if __name__ == "__main__":
    contentType = sys.argv[1]
    key = sys.argv[2]
    match contentType:
        case "youtube":
            metadata = json.loads(sys.argv[3])
            transcript = fetch_transcript(video_id=key,metadata=metadata)
            print(json.dumps(transcript))
        case "pdf":
            docs = extract_pdf_form_key(key)
            print(json.dumps(docs))