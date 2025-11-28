import { Brain, Shield, Zap, AlertCircle, Database } from "lucide-react";
import { 
  DocSection, 
  AlertBox, 
  ComparisonGrid, 
  StepList, 
  CodeBlock,
  MetricGrid,
  HighlightBox 
} from "@/components/docs/common";

export function PersonalitySystemSection() {
  const workflowSteps = [
    {
      title: "personality.json Loaded",
      description: "Build time: lib/ai-moods.ts imports traits, guidelines, red flags"
    },
    {
      title: "Mood Config Generated", 
      description: "Professional or GenZ system prompts created with specific tone rules"
    },
    {
      title: "User Sends Query",
      description: "Query processed through validation, preprocessing, FAQ matching"
    },
    {
      title: "Session Memory Loaded",
      description: "Redis: Last 8 messages for AI context + full history for UI display"
    },
    {
      title: "RAG Search Executed",
      description: "Upstash Vector: Semantic search with personality-aware results"
    },
    {
      title: "Context Assembly",
      description: "Memory + RAG + personality rules + mood-specific prompts combined"
    },
    {
      title: "AI Response Generated",
      description: "Groq AI: llama-3.1-8b with personality validation and error handling"
    },
    {
      title: "Memory Updated",
      description: "New exchange saved to Redis for future follow-up context"
    }
  ];

  const storageMetrics = [
    { label: "Session Memory", value: "8 messages", description: "AI context optimization" },
    { label: "Storage TTL", value: "1h", description: "Auto-cleanup" },
    { label: "Redis Keys", value: "2 types", description: "Memory + history separation" }
  ];

  const errorTypes = [
    {
      title: "Unrelated Queries",
      professional: "I focus on my professional background and technical projects. Please ask about my experience, skills, or projects.",
      genz: "yo that's not really about me or my work, ask me something about my projects or tech stuff instead!"
    },
    {
      title: "Too Short/Unclear", 
      professional: "Could you provide more context so I can give you a comprehensive response?",
      genz: "ngl that's a bit vague, can you be more specific about what you wanna know?"
    },
    {
      title: "No Context Available",
      professional: "I don't have specific information about that topic in my knowledge base.",
      genz: "hmm I don't have the deets on that one, try asking about something else!"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Personality System Architecture</h1>
        <p className="text-xl text-muted-foreground">
          How personality.json powers dual storage memory, persona-aware error handling, and prevents generic AI responses between professional and GenZ modes.
        </p>
      </div>

      <AlertBox type="info" icon={Brain} title="The Problem We Solved">
        <p>
          Generic AI chatbots give vague, cookie-cutter responses and fail at follow-up questions. They say things like &ldquo;I can answer questions about my experience&rdquo; 
          instead of providing specific, authentic information. They also leak personality traits between modes and give the same error messages regardless of context. 
          Our system solves this with dual storage memory, persona-aware error handling, and strict personality validation.
        </p>
      </AlertBox>

      <DocSection title="The Personality Layer" subtitle="Behavior Rules That Make AI Responses Authentic" icon={Shield}>
        <p className="text-sm mb-4">
          personality.json acts as a behavioral constitution for the AI. It defines not just WHAT to say, but HOW to say it, 
          what to avoid, and how to maintain authenticity across different conversation modes.
        </p>

        <ComparisonGrid
          before={{
            title: "Without Personality System",
            items: [
              "\"I can answer questions about my projects\"",
              "\"I have experience with various technologies\"", 
              "\"Feel free to ask me anything\"",
              "Professional mode uses emojis 😊",
              "GenZ mode sounds corporate and stiff"
            ]
          }}
          after={{
            title: "With Personality System", 
            items: [
              "\"I built an AI-Powered Portfolio with RAG using Next.js 15 and Groq AI\"",
              "\"I competed internationally in robotics at 13 - finished 4th/118 teams\"",
              "\"yeah Next.js 15 with TypeScript is the main setup 🔥\" (GenZ only)",
              "Professional mode: Clear, formal, no slang",
              "GenZ mode: Casual, slang-rich, emoji-enhanced"
            ]
          }}
        />
      </DocSection>

      <DocSection title="How Personality System Works">
        <CodeBlock title="Workflow: From JSON to Response">
          <StepList steps={workflowSteps} />
        </CodeBlock>
      </DocSection>

      <DocSection title="Dual Storage System" icon={Database}>
        <p className="text-sm text-muted-foreground mb-4">
          Redis-backed dual storage separates AI context (8 messages) from UI display (complete history) for optimal performance and user experience.
        </p>
        
        <MetricGrid metrics={storageMetrics} />
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <HighlightBox type="info" title="Session Memory (AI Context)">
            <p>Key: chat_session:{`{sessionId}`}</p>
            <p>Purpose: Last 8 messages for AI conversation context</p>
            <p>Optimized for: Token efficiency, follow-up understanding</p>
          </HighlightBox>
          <HighlightBox type="tip" title="Chat History (UI Display)"> 
            <p>Key: chat_history:{`{sessionId}`}</p>
            <p>Purpose: Complete conversation for UI sidebar</p>
            <p>Optimized for: User experience, conversation review</p>
          </HighlightBox>
        </div>
      </DocSection>

      <DocSection title="Persona-Aware Error Handling" icon={AlertCircle}>
        <p className="text-sm text-muted-foreground mb-4">
          Six distinct error types with mood-specific responses ensure consistent personality even during error states.
        </p>
        
        <div className="space-y-4">
          {errorTypes.map((error, index) => (
            <div key={index} className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-3">{error.title}</h4>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Professional</p>
                  <p className="text-muted-foreground">&ldquo;{error.professional}&rdquo;</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                  <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">GenZ</p>
                  <p className="text-muted-foreground">&ldquo;{error.genz}&rdquo;</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CodeBlock title="Implementation" className="mt-4">
{`// lib/response-validator.ts
export function getPersonaResponse(errorType: string, mood: 'professional' | 'genz') {
  const responses = errorResponses[errorType];
  return responses?.[mood] || responses?.professional || defaultResponse;
}

// Usage in API
const errorType = validateQuery(query);
if (errorType) {
  return getPersonaResponse(errorType, mood);
}`}
        </CodeBlock>
      </DocSection>

      <DocSection title="Benefits & Impact" icon={Zap}>
        <div className="grid md:grid-cols-3 gap-4">
          <HighlightBox type="success">
            <p className="font-medium">Authentic Responses</p>
            <p className="text-xs mt-1">Specific, contextual answers instead of generic templates</p>
          </HighlightBox>
          <HighlightBox type="success">
            <p className="font-medium">Mode Consistency</p> 
            <p className="text-xs mt-1">Professional and GenZ personalities never cross-contaminate</p>
          </HighlightBox>
          <HighlightBox type="success">
            <p className="font-medium">Smart Memory</p>
            <p className="text-xs mt-1">Optimal context for AI with complete history for users</p>
          </HighlightBox>
        </div>
      </DocSection>
    </div>
  );
}