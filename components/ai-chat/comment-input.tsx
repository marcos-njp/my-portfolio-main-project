"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Send } from "lucide-react";

interface CommentInputProps {
  messageId: string;
  onComment: (messageId: string, comment: string, rating: 'positive' | 'neutral') => void;
}

export function CommentInput({ messageId, onComment }: CommentInputProps) {
  const [comment, setComment] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickComment = (text: string) => {
    onComment(messageId, text, 'positive');
    setShowInput(false);
  };

  const handleCustomComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    const rating = comment.toLowerCase().includes('good') || 
                   comment.toLowerCase().includes('great') || 
                   comment.toLowerCase().includes('excellent') || 
                   comment.toLowerCase().includes('wonderful') 
                   ? 'positive' : 'neutral';
    
    onComment(messageId, comment.trim(), rating);
    setComment("");
    setShowInput(false);
    setIsSubmitting(false);
  };

  return (
    <div className="mt-2 space-y-2">
      {!showInput ? (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickComment("That's wonderful! This is good.")}
            className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ThumbsUp className="w-3 h-3 mr-1" />
            Good
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(true)}
            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Comment
          </Button>
        </div>
      ) : (
        <div className="space-y-2 p-3 bg-muted/30 rounded-md">
          <Textarea
            placeholder="Add your feedback (e.g., 'That is wonderful! This is good.')"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleCustomComment();
              }
            }}
          />
          <div className="flex gap-2 justify-between">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickComment("That's wonderful!")}
                className="h-7 text-xs"
              >
                Wonderful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickComment("That is good!")}
                className="h-7 text-xs"
              >
                Good
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInput(false);
                  setComment("");
                }}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomComment}
                disabled={!comment.trim() || isSubmitting}
                className="h-7 text-xs"
              >
                <Send className="w-3 h-3 mr-1" />
                Send
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Press Ctrl+Enter to send quickly
          </p>
        </div>
      )}
    </div>
  );
}