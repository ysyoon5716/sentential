"use client";

import { useState } from "react";
import { HiPencilSquare, HiTrash, HiClipboardDocument, HiClipboardDocumentCheck } from "react-icons/hi2";
import { Sentence, updateSentence, deleteSentence } from "@/lib/api";
import RenderedContent from "./RenderedContent";

interface Props {
  sentence: Sentence;
  onUpdate: () => void;
  onClickContent?: (id: number, content: string) => void;
}

export default function SentenceCard({ sentence, onUpdate, onClickContent }: Props) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(sentence.content);
  const [editSource, setEditSource] = useState(sentence.source ?? "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sentence.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave() {
    setLoading(true);
    try {
      await updateSentence(sentence.id, editContent, editSource);
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
          <input
            type="text"
            value={editSource}
            onChange={(e) => setEditSource(e.target.value)}
            placeholder="출처 (선택)"
            className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
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
          <RenderedContent
            content={sentence.content}
            className={`text-white flex-1${onClickContent ? " cursor-pointer hover:text-neutral-300 transition-colors" : ""}`}
            onClick={onClickContent ? () => onClickContent(sentence.id, sentence.content) : undefined}
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              {copied ? (
                <HiClipboardDocumentCheck className="w-4 h-4 text-green-400" />
              ) : (
                <HiClipboardDocument className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <HiPencilSquare className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {!editing && sentence.source && (
        <p className="text-xs text-neutral-500 mt-2">
          출처: {sentence.source}
        </p>
      )}
      {sentence.similarity !== undefined && (
        <p className="text-xs text-neutral-600 mt-2">
          유사도: {(sentence.similarity * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
}
