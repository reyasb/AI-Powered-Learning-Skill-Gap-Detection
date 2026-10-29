from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    AIConversation, AIMessage, UploadedLearningDocument, DocumentChunk, User
)
from app.api.auth import get_current_user
from app.schemas.schemas import ChatMessageRequest
from app.services.rag_service import RAGService

router = APIRouter(prefix="/learning", tags=["Learning Assistant (RAG)"])

@router.post("/chat")
async def chat_with_materials(
    data: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.message or not data.message.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Manage Conversation Session
    conversation = None
    if data.conversation_id:
        conversation = db.query(AIConversation).filter(
            AIConversation.id == data.conversation_id,
            AIConversation.user_id == current_user.id
        ).first()

    if not conversation:
        title = data.message[:40] + ("..." if len(data.message) > 40 else "")
        conversation = AIConversation(
            user_id=current_user.id,
            title=title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Record User Message
    db.add(AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=data.message.strip()
    ))
    db.commit()

    # 3. Retrieve relevant chunks from user's documents
    chunk_query = db.query(DocumentChunk).join(
        UploadedLearningDocument,
        DocumentChunk.document_id == UploadedLearningDocument.id
    ).filter(UploadedLearningDocument.user_id == current_user.id)

    if data.document_ids and len(data.document_ids) > 0:
        chunk_query = chunk_query.filter(UploadedLearningDocument.id.in_(data.document_ids))

    all_user_chunks = chunk_query.all()

    # 4. Perform Retrieval
    retrieved = RAGService.retrieve_relevant_chunks(data.message, all_user_chunks, top_k=4)

    # 5. Generate Grounded Response
    ai_result = await RAGService.generate_grounded_answer(data.message, retrieved)

    # 6. Record Assistant Message
    assistant_msg = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_result["answer"],
        sources_json=ai_result["sources"]
    )
    db.add(assistant_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "conversation_id": conversation.id,
        "response": ai_result["answer"],
        "sources": ai_result["sources"]
    }

@router.get("/conversations")
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.updated_at.desc()).all()

    return [{
        "id": c.id,
        "title": c.title,
        "message_count": len(c.messages),
        "created_at": c.created_at,
        "updated_at": c.updated_at
    } for c in convs]

@router.get("/conversations/{id}")
def get_conversation_messages(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(AIConversation).filter(
        AIConversation.id == id,
        AIConversation.user_id == current_user.id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return {
        "id": conv.id,
        "title": conv.title,
        "messages": [{
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": m.sources_json or [],
            "created_at": m.created_at
        } for m in conv.messages]
    }
