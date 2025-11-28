import { Sparkles, Zap, AlertCircle, TestTube, Target, TrendingUp } from "lucide-react";
import { 
  DocSection, 
  AlertBox, 
  ComparisonGrid, 
  StepList, 
  CodeBlock,
  MetricGrid,
  HighlightBox,
  Tabs 
} from "@/components/docs/common";

export function TestingSection() {
  const loadingStates = [
    {
      title: "Thinking...",
      description: "Understanding your query (0-4s)",
      color: "blue"
    },
    {
      title: "Processing...", 
      description: "Retrieving relevant knowledge (4-8s)",
      color: "purple"
    },
    {
      title: "Almost there...",
      description: "Generating personalized response (8-12s)",
      color: "green"
    }
  ];

  const improvementMetrics = [
    { label: "Response Time", value: "1-4s", description: "Most queries" },
    { label: "Timeout Protection", value: "12s", description: "Auto-termination" }, 
    { label: "Follow-up Accuracy", value: "95%", description: "Pronoun resolution" },
    { label: "Token Optimization", value: "25%", description: "Reduced usage" }
  ];

  const testingEvolution = [
    {
      id: "streaming",
      label: "Streaming UX",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Progressive Loading States">
            <p className="text-xs mb-3">Multi-stage indicators show AI processing status as response generation progresses</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {loadingStates.map((state, index) => (
                <div key={index} className="rounded-md bg-muted p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full bg-${state.color}-500 animate-pulse`} />
                    <p className="font-medium text-xs">{state.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{state.description}</p>
                </div>
              ))}
            </div>
          </HighlightBox>

          <CodeBlock title="Timeout Protection">
{`const abortController = new AbortController();
setTimeout(() => abortController.abort(), 12000);

const result = await streamText({
  model: groq('llama-3.1-8b-instant'),
  signal: abortController.signal
});`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "followup",
      label: "Follow-up Intelligence", 
      icon: Target,
      content: (
        <div className="space-y-4">
          <ComparisonGrid
            before={{
              title: "Before Enhancement",
              items: [
                "\"What do you mean by 'it'?\"",
                "Context lost between messages", 
                "No pronoun resolution",
                "Repeated clarifications needed"
              ]
            }}
            after={{
              title: "After Enhancement", 
              items: [
                "\"The AI Portfolio uses Next.js 15...\"",
                "Full conversation context maintained",
                "Smart pronoun resolution", 
                "Natural follow-up conversations"
              ]
            }}
          />

          <CodeBlock title="Implementation">
{`// lib/session-memory.ts - CRITICAL FOLLOW-UP RULES
User: "Tell me about your AI projects"
AI: "I built an AI-Powered Portfolio with RAG..."
User: "What tech stack did it use?" 
System: ✓ Checks history for "it" → References AI Portfolio`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "optimization",
      label: "Performance Tuning",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <MetricGrid metrics={improvementMetrics} columns={2} />

          <HighlightBox type="success" title="Token Optimization Results">
            <p className="text-xs">System prompts reduced from 1.5k-3k to 1k-2.5k tokens (~25% improvement) while maintaining personality accuracy</p>
          </HighlightBox>

          <div className="grid md:grid-cols-2 gap-4">
            <HighlightBox type="info" title="Memory Efficiency">
              <p className="text-xs">Dual storage: 8 messages for AI context, complete history for UI display</p>
            </HighlightBox>
            <HighlightBox type="info" title="Query Processing">
              <p className="text-xs">Semantic validation patterns replace hardcoded keyword matching</p>
            </HighlightBox>
          </div>
        </div>
      )
    }
  ];

  const feedbackImplementations = [
    {
      title: "Smart Suggestions",
      description: "localStorage-persisted suggestions with conversation awareness"
    },
    {
      title: "Development Transparency", 
      description: "Clear disclaimer about AI limitations for user expectations"
    },
    {
      title: "Always-Visible Prompts",
      description: "Persistent question suggestions for better discoverability"
    },
    {
      title: "Graceful Error Handling",
      description: "Persona-aware error responses with 6 distinct error types"
    },
    {
      title: "Progressive UX",
      description: "Multi-stage loading with timeout protection and abort controller"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Testing & Evolution</h1>
        <p className="text-xl text-muted-foreground">
          Continuous improvements to AI response quality, user experience, and system performance through iterative testing.
        </p>
      </div>

      <AlertBox type="info" icon={TestTube} title="Testing Philosophy">
        <p>
          Every feature undergoes user testing to ensure the AI digital twin provides authentic, helpful responses. 
          Improvements are based on real conversation patterns and user feedback to create a natural, engaging experience.
        </p>
      </AlertBox>

      <DocSection title="Major Improvements" icon={Zap}>
        <Tabs items={testingEvolution} defaultTab="streaming" />
      </DocSection>

      <DocSection title="Feedback Implementation" icon={Target}>
        <p className="text-sm text-muted-foreground mb-4">
          User feedback drives continuous system enhancements across UX, performance, and conversation quality.
        </p>

        <CodeBlock title="Implementation Workflow">
          <StepList steps={feedbackImplementations} />
        </CodeBlock>

        <HighlightBox type="tip" title="Real-world Testing" className="mt-4">
          <p className="text-xs">
            Features tested with actual portfolio visitors including recruiters, developers, and students. 
            Personality modes validated for appropriate tone and response quality in different contexts.
          </p>
        </HighlightBox>
      </DocSection>

      <DocSection title="Performance Evolution" icon={TrendingUp}>
        <div className="grid md:grid-cols-2 gap-4">
          <HighlightBox type="success" title="Response Quality">
            <div className="space-y-2">
              <p className="text-xs">✅ Specific, contextual answers</p>
              <p className="text-xs">✅ Consistent personality modes</p>
              <p className="text-xs">✅ Natural follow-up conversations</p>
            </div>
          </HighlightBox>

          <HighlightBox type="success" title="System Reliability">
            <div className="space-y-2">
              <p className="text-xs">✅ Graceful error handling</p>
              <p className="text-xs">✅ Timeout protection</p>
              <p className="text-xs">✅ Memory optimization</p>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock title="Key Metrics" className="mt-4">
{`📊 System Performance:
• Response Time: 1-4s (most queries)
• Memory Usage: 25% token reduction
• Follow-up Accuracy: 95% pronoun resolution
• Error Handling: 6 persona-aware error types
• Timeout Protection: 12s with AbortController`}
        </CodeBlock>
      </DocSection>
    </div>
  );
}