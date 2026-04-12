"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    const ok = await login(password);
    if (ok) {
      router.push("/");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="font-bold tracking-tight text-2xl mb-8">Sentential</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full bg-transparent border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors disabled:opacity-30"
          >
            {loading ? "..." : "로그인"}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-400 mt-4">{error}</p>
        )}
      </div>
    </main>
  );
}
