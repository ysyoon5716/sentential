from datetime import datetime

from pydantic import BaseModel


class SentenceCreate(BaseModel):
    content: str
    source: str | None = None


class SentenceUpdate(BaseModel):
    content: str
    source: str | None = None


class SentenceResponse(BaseModel):
    id: int
    content: str
    source: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SentenceSearchResult(SentenceResponse):
    similarity: float
