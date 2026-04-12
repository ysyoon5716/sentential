from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import Sentence
from app.schemas import (
    SentenceCreate,
    SentenceResponse,
    SentenceSearchResult,
    SentenceUpdate,
)
from app.services.embedding import get_embedding, get_query_embedding

router = APIRouter(
    prefix="/api/sentences",
    tags=["sentences"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", response_model=SentenceResponse, status_code=201)
async def create_sentence(body: SentenceCreate, db: AsyncSession = Depends(get_db)):
    embedding = await get_embedding(body.content)
    sentence = Sentence(content=body.content, embedding=embedding)
    db.add(sentence)
    await db.commit()
    await db.refresh(sentence)
    return sentence


@router.get("/recent", response_model=list[SentenceResponse])
async def list_recent_sentences(limit: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(Sentence).order_by(Sentence.updated_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/search", response_model=list[SentenceSearchResult])
async def search_sentences(q: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty")

    query_embedding = await get_query_embedding(q)
    embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

    stmt = text("""
        SELECT id, content, created_at, updated_at,
               1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM sentences
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """)

    result = await db.execute(stmt, {"embedding": embedding_str, "limit": limit})
    rows = result.mappings().all()
    return [SentenceSearchResult(**row) for row in rows]


@router.get("/{sentence_id}/similar", response_model=list[SentenceSearchResult])
async def search_similar_sentences(
    sentence_id: int, limit: int = 20, db: AsyncSession = Depends(get_db)
):
    sentence = await db.get(Sentence, sentence_id)
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    stmt = text("""
        SELECT id, content, created_at, updated_at,
               1 - (embedding <=> (SELECT embedding FROM sentences WHERE id = :sentence_id)) AS similarity
        FROM sentences
        ORDER BY embedding <=> (SELECT embedding FROM sentences WHERE id = :sentence_id)
        LIMIT :limit
    """)

    result = await db.execute(stmt, {"sentence_id": sentence_id, "limit": limit})
    rows = result.mappings().all()
    return [SentenceSearchResult(**row) for row in rows]


@router.put("/{sentence_id}", response_model=SentenceResponse)
async def update_sentence(
    sentence_id: int, body: SentenceUpdate, db: AsyncSession = Depends(get_db)
):
    sentence = await db.get(Sentence, sentence_id)
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    sentence.content = body.content
    sentence.embedding = await get_embedding(body.content)
    await db.commit()
    await db.refresh(sentence)
    return sentence


@router.delete("/{sentence_id}", status_code=204)
async def delete_sentence(sentence_id: int, db: AsyncSession = Depends(get_db)):
    sentence = await db.get(Sentence, sentence_id)
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")

    await db.delete(sentence)
    await db.commit()
