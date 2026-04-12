const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Sentence {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  similarity?: number;
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_URL}${input}`, {
    ...init,
    credentials: "include",
  });
  if (res.status === 401 && typeof window !== "undefined" && !input.startsWith("/api/auth/")) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res;
}

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await apiFetch("/api/auth/me");
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    credentials: "include",
  });
  return res.ok;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getRecentSentences(): Promise<Sentence[]> {
  const res = await apiFetch("/api/sentences/recent");
  if (!res.ok) throw new Error("Fetch recent failed");
  return res.json();
}

export async function getRandomSentence(): Promise<Sentence> {
  const res = await apiFetch("/api/sentences/random");
  if (!res.ok) throw new Error("Random fetch failed");
  return res.json();
}

export async function searchSentences(query: string): Promise<Sentence[]> {
  const res = await apiFetch(
    `/api/sentences/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function searchSimilarSentences(id: number): Promise<Sentence[]> {
  const res = await apiFetch(`/api/sentences/${id}/similar`);
  if (!res.ok) throw new Error("Similar search failed");
  return res.json();
}

export async function createSentence(content: string): Promise<Sentence> {
  const res = await apiFetch("/api/sentences", {
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
  const res = await apiFetch(`/api/sentences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteSentence(id: number): Promise<void> {
  const res = await apiFetch(`/api/sentences/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}
