"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  content: string;
  className?: string;
  onClick?: () => void;
}

export default function RenderedContent({ content, className, onClick }: Props) {
  return (
    <div className={`rendered-content ${className ?? ""}`} onClick={onClick}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
