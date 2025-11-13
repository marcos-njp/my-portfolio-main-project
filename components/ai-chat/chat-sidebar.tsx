"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type AIMood } from "@/lib/ai-moods";
import { X, Sparkles, Loader2 } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { MoodSelector } from "./mood-selector";
import { SuggestedQuestions } from "./suggested-questions";
import { CommentInput } from "./comment-input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  comment?: string;
  rating?: 'positive' | 'neutral';
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "What are your top skills?",
  "Tell me about your projects",
  "What's your education background?",
];

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm an AI assistant here to help answer your questions about this portfolio. Feel free to ask about technical skills, projects, education, or work experience.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingTimeout, setThinkingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentMood, setCurrentMood] = useState<AIMood>("professional");
  
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ai_chat_session_id');
      if (stored) {
        console.log('[Session] Restored existing session:', stored);
        return stored;
      }
    }
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_chat_session_id', newId);
    }
    console.log('[Session] Created new session:', newId);
    return newId;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(`[Session] ID: ${sessionId}, Mood: ${currentMood}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log(`[Mood Change] New mood: ${currentMood}`);
  }, [currentMood]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add thinking message after 4 seconds
    const timeout = setTimeout(() => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === '') {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              content: '🤔 Let me formulate a comprehensive response for you...'
            }
          ];
        }
        return prev;
      });
    }, 4000);
    setThinkingTimeout(timeout);

    console.log(`[API Call] 🚀 Sending query: "${input.trim()}" with mood: ${currentMood}, sessionId: ${sessionId}`);

    const requestBody = {
      messages: [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      })),
      mood: currentMood,
      sessionId: sessionId,
    };
    
    console.log('[API Call] 📦 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: errorData.message || "Please ask about my professional background, skills, or projects.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (response.status === 500) {
        const errorData = await response.json();
        console.error('[API Error]', errorData);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `⚠️ Server error: ${errorData.message || 'Failed to generate response'}${errorData.details ? `\n\nDetails: ${errorData.details}` : ''}`,
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        console.error('[API Error] Status:', response.status, 'Status Text:', response.statusText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader is null');
      }
      
      const decoder = new TextDecoder();
      let aiResponse = "";

      // Clear thinking timeout
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        setThinkingTimeout(null);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = aiResponse;
          }
          return newMessages;
        });
      }

      console.log('[API Call] ✅ Full response:', aiResponse);
      
      // Clear any remaining timeout
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        setThinkingTimeout(null);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("[API Error]", error);
      
      // Clear timeout on error
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        setThinkingTimeout(null);
      }
      
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "⚠️ Sorry, I encountered an error. Please try again.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleComment = (messageId: string, comment: string, rating: 'positive' | 'neutral') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, comment, rating } : msg
      )
    );

    // AI responds to recruiter feedback naturally
    let aiResponse = "";
    if (rating === 'positive') {
      aiResponse = `Thank you so much! I'm happy I could help you. ${comment.includes('wonderful') || comment.includes('great') ? "I appreciate your kind words!" : ""} What else would you like to know about the portfolio?`;
    } else {
      aiResponse = `I appreciate your feedback. I'm sorry if my response wasn't perfect - I'm still under development and my intelligence is limited. I'll do my best to improve! Is there something specific I can clarify or expand on?`;
    }
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
      },
    ]);

    console.log('[Comment] Recruiter feedback (NOT recorded in DB):', { messageId, comment, rating });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="border-b p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">AI Digital Twin</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online • Powered by Groq AI
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <MoodSelector currentMood={currentMood} onMoodChange={setCurrentMood} />

            {messages.length === 1 && (
              <SuggestedQuestions suggestions={SUGGESTIONS} onSelect={handleSuggestionClick} />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <ChatMessage role={message.role} content={message.content} />
                {message.role === "assistant" && !message.comment && message.content && (
                  <CommentInput messageId={message.id} onComment={handleComment} />
                )}
                {message.comment && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs border-l-2 border-green-500">
                    <span className="text-green-700 dark:text-green-300">💬 {message.comment}</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[85%] rounded-lg p-4 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
