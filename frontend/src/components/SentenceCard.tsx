"use client";

import { useState } from "react";
import { Sentence, updateSentence, deleteSentence } from "@/lib/api";

interface Props {
  sentence: Sentence;
  onUpdate: () => void;
}

export default function SentenceCard({ sentence, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(sentence.content);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateSentence(sentence.id, editContent);
      setEditing(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteSentence(sentence.id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-800 rounded-lg p-4 hover:border-neutral-600 transition-colors">
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white resize-none focus:outline-none focus:border-neutral-500"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1 text-sm bg-white text-black rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start gap-4">
          <p className="text-white flex-1">{sentence.content}</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-neutral-500 hover:text-white transition-colors"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-sm text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </div>
      )}
      {sentence.similarity !== undefined && (
        <p className="text-xs text-neutral-600 mt-2">
          유사도: {(sentence.similarity * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
}
