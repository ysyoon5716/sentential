const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Sentence {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  similarity?: number;
}

export async function searchSentences(query: string): Promise<Sentence[]> {
  const res = await fetch(
    `${API_URL}/api/sentences/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function createSentence(content: string): Promise<Sentence> {
  const res = await fetch(`${API_URL}/api/sentences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function updateSentence(
  id: number,
  content: string
): Promise<Sentence> {
  const res = await fetch(`${API_URL}/api/sentences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteSentence(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/sentences/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}
