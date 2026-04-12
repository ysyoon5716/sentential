import voyageai

from app.config import VOYAGE_API_KEY

client = voyageai.Client(api_key=VOYAGE_API_KEY)


async def get_embedding(text: str) -> list[float]:
    result = client.embed([text], model="voyage-4", input_type="document")
    return result.embeddings[0]


async def get_query_embedding(text: str) -> list[float]:
    result = client.embed([text], model="voyage-4", input_type="query")
    return result.embeddings[0]
