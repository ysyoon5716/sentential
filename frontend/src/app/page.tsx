"use client";

import { useState, useCallback } from "react";
import { Sentence, searchSentences, createSentence } from "@/lib/api";
import SentenceCard from "@/components/SentenceCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Sentence[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await searchSentences(query);
      setResults(data);
      setSearched(true);
    } catch {
      setMessage("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  async function handleSave() {
    if (!query.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      await createSentence(query.trim());
      setMessage("저장되었습니다.");
      setQuery("");
      if (searched) {
        const data = await searchSentences(query);
        setResults(data);
      }
    } catch {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4">
      <div
        className={`w-full max-w-2xl flex flex-col items-center transition-all duration-500 ${
          searched ? "pt-8" : "justify-center flex-1"
        }`}
      >
        <h1
          className={`font-bold tracking-tight transition-all duration-500 ${
            searched ? "text-2xl mb-6" : "text-5xl mb-10"
          }`}
        >
          Sentential
        </h1>

        <div className="w-full flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="문장을 입력하세요..."
            className="flex-1 bg-transparent border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving || !query.trim()}
            className="px-4 py-3 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors disabled:opacity-30 shrink-0"
          >
            {saving ? "..." : "저장"}
          </button>
        </div>

        {message && (
          <p className="text-sm text-neutral-500 mt-3">{message}</p>
        )}

        {loading && (
          <p className="text-sm text-neutral-600 mt-6">검색 중...</p>
        )}

        {searched && !loading && (
          <div className="w-full mt-6 flex flex-col gap-3">
            {results.length === 0 ? (
              <p className="text-neutral-600 text-center">
                일치하는 문장이 없습니다.
              </p>
            ) : (
              results.map((s) => (
                <SentenceCard
                  key={s.id}
                  sentence={s}
                  onUpdate={handleSearch}
                />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
