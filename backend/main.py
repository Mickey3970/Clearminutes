from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
import json

from database import engine, get_db, Base
import models
from services.transcription import validate_audio_file, transcribe_audio
from services.summarization import summarize_transcript, extract_action_items
from services.storage import save_upload, delete_file

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ClearMinutes API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://clearminutes.vercel.app"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Background processing task ──────────────────────────────────────────────

def process_meeting(job_id: str, file_path: str):
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Mark as processing
        job = db.query(models.Job).filter(models.Job.id == job_id).first()
        job.status = "processing"
        db.commit()

        # Stage 1: Transcribe
        transcript = transcribe_audio(file_path)

        # Stage 2: Summarize
        summary = summarize_transcript(transcript)

        # Stage 3: Extract action items
        action_items = extract_action_items(transcript)

        # Save result
        result = models.Result(
            job_id=job_id,
            transcript=transcript,
            overview=summary.get("overview", ""),
            key_points=json.dumps(summary.get("key_points", [])),
            decisions=json.dumps(summary.get("decisions", [])),
            open_questions=json.dumps(summary.get("open_questions", [])),
            action_items=json.dumps(action_items),
        )
        db.add(result)

        job.status = "completed"
        db.commit()

        # Clean up uploaded file after processing
        delete_file(file_path)

    except Exception as e:
        job = db.query(models.Job).filter(models.Job.id == job_id).first()
        job.status = "failed"
        job.error_msg = str(e)
        db.commit()
    finally:
        db.close()


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()

    # Validate
    valid, error = validate_audio_file(file.filename, len(file_bytes))
    if not valid:
        raise HTTPException(status_code=400, detail=error)

    # Save file
    file_path = await save_upload(file_bytes, file.filename)

    # Create job record
    job = models.Job(
        filename=file.filename,
        file_path=file_path,
        status="pending"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Queue background processing
    background_tasks.add_task(process_meeting, job.id, file_path)

    return {"job_id": job.id, "status": "pending"}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = {
        "job_id": job.id,
        "status": job.status,
        "filename": job.filename,
        "created_at": job.created_at,
        "error_msg": job.error_msg,
        "result": None
    }

    if job.status == "completed":
        result = db.query(models.Result).filter(models.Result.job_id == job_id).first()
        if result:
            response["result"] = {
                "transcript": result.transcript,
                "overview": result.overview,
                "key_points": json.loads(result.key_points),
                "decisions": json.loads(result.decisions),
                "open_questions": json.loads(result.open_questions),
                "action_items": json.loads(result.action_items),
            }

    return response


@app.get("/api/jobs/{job_id}/export")
def export_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job or job.status != "completed":
        raise HTTPException(status_code=404, detail="Job not found or not completed")

    result = db.query(models.Result).filter(models.Result.job_id == job_id).first()
    key_points = json.loads(result.key_points)
    decisions = json.loads(result.decisions)
    open_questions = json.loads(result.open_questions)
    action_items = json.loads(result.action_items)

    decisions_lines = [f"- {d}" for d in decisions] if decisions else ["- None recorded"]
    questions_lines = [f"- {q}" for q in open_questions] if open_questions else ["- None recorded"]

    lines = [
        f"# Meeting Minutes — {job.filename}",
        "",
        "## Overview",
        result.overview,
        "",
        "## Key Discussion Points",
        *[f"- {p}" for p in key_points],
        "",
        "## Decisions Made",
        *decisions_lines,
        "",
        "## Open Questions",
        *questions_lines,
        "",
        "## Action Items",
    ]

    for item in action_items:
        assignee = f" — Assignee: {item['assignee']}" if item.get("assignee") else ""
        deadline = f" — Deadline: {item['deadline']}" if item.get("deadline") else ""
        lines.append(f"- [ ] {item['task']}{assignee}{deadline}")

    lines += ["", "---", "## Full Transcript", "", result.transcript]

    return PlainTextResponse(
        content="\n".join(lines),
        headers={"Content-Disposition": f"attachment; filename=minutes_{job_id[:8]}.md"}
    )


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"deleted": True}


@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/debug/{job_id}")
def debug_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    return {
        "status": job.status,
        "error_msg": job.error_msg
    }
