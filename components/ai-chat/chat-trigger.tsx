"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { useState } from "react"

interface ChatTriggerProps {
  onClick: () => void
}

export default function ChatTrigger({ onClick }: ChatTriggerProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-30 group">
      {/* Tooltip */}
      <div
        className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg shadow-lg whitespace-nowrap transition-all duration-200 ${
          showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        Chat with my AI Digital Twin!
        <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-foreground transform rotate-45" />
      </div>

      <Button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        size="lg"
        className="h-16 w-16 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 hover:scale-110"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110 relative z-10" />
        <Sparkles className="h-4 w-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="sr-only">Open AI Chat</span>
        
        {/* Pulse animation rings */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse" />
        
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      </Button>
    </div>
  )
}
