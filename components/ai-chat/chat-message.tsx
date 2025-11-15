"use client";

import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  error?: string;
}

export function ChatMessage({ role, content, isStreaming = false, error }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  
  const isThinking = role === "assistant" && (content.startsWith('Thinking') || content.startsWith('Processing') || content.startsWith('Almost'));
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}>
      {role === "assistant" && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          {isThinking ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}
        </div>
      )}
      
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div
          className={`rounded-lg p-4 ${
            role === "user" 
              ? "bg-primary text-primary-foreground" 
              : error 
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-muted"
          }`}
        >
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            error ? "text-destructive" : ""
          }`}>
            {content}
          </p>
          
          {isStreaming && role === "assistant" && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span>Generating...</span>
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-xs text-destructive/70">
              Error: {error}
            </div>
          )}
        </div>

        {/* Action buttons for assistant messages only */}
        {role === "assistant" && !isStreaming && !error && (
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
