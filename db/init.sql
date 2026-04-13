CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS sentences (
    id         BIGSERIAL PRIMARY KEY,
    content    TEXT NOT NULL,
    source     TEXT,
    embedding  vector(1024),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sentences_embedding_idx
    ON sentences USING hnsw (embedding vector_cosine_ops);
