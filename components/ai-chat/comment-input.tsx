"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface CommentInputProps {
  messageId: string;
  onComment: (messageId: string, comment: string, rating: 'positive' | 'negative') => void;
}

export function CommentInput({ messageId, onComment }: CommentInputProps) {
  const [voted, setVoted] = useState(false);

  const handleVote = (rating: 'positive' | 'negative') => {
    if (voted) return;
    setVoted(true);
    onComment(messageId, rating === 'positive' ? 'helpful' : 'not helpful', rating);
  };

  if (voted) return null;

  return (
    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('positive')}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-green-600"
        title="Helpful"
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('negative')}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
        title="Not helpful"
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>
    </div>
  );
}