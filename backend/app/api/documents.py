from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from app.core.database import get_db
from app.core.config import settings
from app.models.models import UploadedLearningDocument, DocumentChunk, User
from app.api.auth import get_current_user
from app.services.resume_parser import ResumeParserService
from app.services.rag_service import chunk_text

router = APIRouter(prefix="/documents", tags=["Learning Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_exts = [".pdf", ".txt", ".md"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in valid_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accepted document formats are: PDF, TXT, and Markdown."
        )

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    upload_path = os.path.join(settings.UPLOAD_DIR, "documents", unique_name)

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save document: {str(e)}")

    # Extract text
    extracted_text = ""
    if ext == ".pdf":
        try:
            extracted_text = ResumeParserService.extract_text_from_pdf(upload_path)
        except Exception:
            extracted_text = ""
    else:
        try:
            with open(upload_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
        except Exception:
            extracted_text = ""

    chunks = chunk_text(extracted_text, chunk_size=450, overlap=40)
    file_size = os.path.getsize(upload_path)

    doc_rec = UploadedLearningDocument(
        user_id=current_user.id,
        filename=file.filename,
        file_path=upload_path,
        file_size_bytes=file_size,
        char_count=len(extracted_text),
        chunk_count=len(chunks)
    )
    db.add(doc_rec)
    db.commit()
    db.refresh(doc_rec)

    for idx, c in enumerate(chunks):
        chunk_entry = DocumentChunk(
            document_id=doc_rec.id,
            chunk_index=idx,
            content=c["content"],
            page_number=c["page_number"],
            keywords_json=c["keywords"]
        )
        db.add(chunk_entry)
    db.commit()

    return {
        "id": doc_rec.id,
        "filename": doc_rec.filename,
        "file_size_bytes": file_size,
        "char_count": len(extracted_text),
        "chunk_count": len(chunks),
        "uploaded_at": doc_rec.uploaded_at
    }

@router.get("")
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(UploadedLearningDocument).filter(
        UploadedLearningDocument.user_id == current_user.id
    ).order_by(UploadedLearningDocument.uploaded_at.desc()).all()

    return [{
        "id": d.id,
        "filename": d.filename,
        "file_size_bytes": d.file_size_bytes,
        "char_count": d.char_count,
        "chunk_count": d.chunk_count,
        "uploaded_at": d.uploaded_at
    } for d in docs]

@router.delete("/{id}")
def delete_document(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(UploadedLearningDocument).filter(
        UploadedLearningDocument.id == id,
        UploadedLearningDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document and all vector chunks deleted."}
