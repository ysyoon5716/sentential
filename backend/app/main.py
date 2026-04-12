from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.sentences import router as sentences_router

app = FastAPI(title="Sentential API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentences_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
