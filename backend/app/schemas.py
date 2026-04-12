from datetime import datetime

from pydantic import BaseModel


class SentenceCreate(BaseModel):
    content: str


class SentenceUpdate(BaseModel):
    content: str


class SentenceResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SentenceSearchResult(SentenceResponse):
    similarity: float
