"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sentence, searchSentences, searchSimilarSentences, createSentence, getRecentSentences, getRandomSentence, checkAuth, logout } from "@/lib/api";
import SentenceCard from "@/components/SentenceCard";
import RenderedContent from "@/components/RenderedContent";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { HiArrowUpTray } from "react-icons/hi2";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Sentence[]>([]);
  const [recentSentences, setRecentSentences] = useState<Sentence[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [message, setMessage] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  const loadRecent = useCallback(async () => {
    try {
      const data = await getRecentSentences();
      setRecentSentences(data);
    } catch {
      // silent fail for initial load
    }
  }, []);

  useEffect(() => {
    checkAuth().then((ok) => {
      if (!ok) {
        router.push("/login");
      } else {
        setAuthChecked(true);
        loadRecent();
      }
    });
  }, [loadRecent, router]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    const q = query.trim();
    setLoading(true);
    setMessage("");
    try {
      const data = await searchSentences(q);
      setResults(data);
      setSearched(true);
      setSearchedQuery(q);
      setQuery("");
    } catch {
      setMessage("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleClickSentence = useCallback(async (id: number, content: string) => {
    setQuery("");
    setLoading(true);
    setMessage("");
    try {
      const data = await searchSimilarSentences(id);
      setResults(data);
      setSearched(true);
      setSearchedQuery(content);
    } catch {
      setMessage("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSave() {
    if (!query.trim()) return;
    const q = query.trim();
    setSaving(true);
    setMessage("");
    try {
      await createSentence(q);
      setMessage("저장되었습니다.");
      setQuery("");
      if (searched) {
        const data = await searchSentences(q);
        setResults(data);
      }
      loadRecent();
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

  async function handleRandom() {
    setLoading(true);
    setMessage("");
    try {
      const data = await getRandomSentence();
      setResults([data]);
      setSearched(true);
      setSearchedQuery(data.content);
      setQuery("");
    } catch {
      setMessage("랜덤 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!authChecked) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4">
      <div
        className="w-full max-w-2xl flex flex-col items-center pt-8"
      >
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="font-bold tracking-tight text-2xl">
            Sentential
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            로그아웃
          </button>
        </div>

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
            onClick={handleRandom}
            disabled={loading}
            className="px-3 py-3 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors disabled:opacity-30 shrink-0"
            title="랜덤 검색"
          >
            <GiPerspectiveDiceSixFacesRandom className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !query.trim()}
            className="px-3 py-3 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors disabled:opacity-30 shrink-0"
            title="저장"
          >
            <HiArrowUpTray className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <p className="text-sm text-neutral-500 mt-3">{message}</p>
        )}

        {loading && (
          <p className="text-sm text-neutral-600 mt-6">검색 중...</p>
        )}

        {searched && searchedQuery && !loading && (
          <div className="w-full mt-5 pb-4 border-b border-neutral-800">
            <RenderedContent
              content={searchedQuery}
              className="text-neutral-300"
            />
          </div>
        )}

        {searched && !loading && (
          <div className="w-full mt-4 flex flex-col gap-3">
            {results.length === 0 ? (
              <p className="text-neutral-600 text-center">
                일치하는 문장이 없습니다.
              </p>
            ) : (
              results.map((s) => (
                <SentenceCard
                  key={s.id}
                  sentence={s}
                  onUpdate={() => { if (searchedQuery) { searchSentences(searchedQuery).then(setResults); } }}
                  onClickContent={handleClickSentence}
                />
              ))
            )}
          </div>
        )}

        {!searched && !loading && (
          <div className="w-full mt-6 flex flex-col gap-3">
            <p className="text-sm text-neutral-500">최근 수정한 문장</p>
            {recentSentences.length === 0 ? (
              <p className="text-neutral-600 text-center mt-4">
                저장된 문장이 없습니다. 위 입력창에 문장을 입력하고 저장해 보세요.
              </p>
            ) : (
              recentSentences.map((s) => (
                <SentenceCard
                  key={s.id}
                  sentence={s}
                  onUpdate={loadRecent}
                  onClickContent={handleClickSentence}
                />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
