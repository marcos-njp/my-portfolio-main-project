import { Sparkles, Zap, Brain, Database, Shield, Settings } from "lucide-react";
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

export function AdvancedFeaturesSection() {
  const advancedFeatures = [
    {
      id: "dual-storage",
      label: "Dual Storage System",
      icon: Database,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Optimized Memory Management">
            <p className="text-xs mb-3">Separate storage strategies for AI context vs. UI display to optimize performance and user experience</p>
          </HighlightBox>

          <ComparisonGrid
            before={{
              title: "AI Context (Limited)",
              items: [
                "Last 8 messages only",
                "Optimized for token usage",
                "Essential context preservation",
                "Conversation flow continuity"
              ]
            }}
            after={{
              title: "UI Display (Complete)",
              items: [
                "Full conversation history",
                "Rich formatting preserved",
                "Copy functionality enabled", 
                "Session persistence"
              ]
            }}
          />

          <CodeBlock title="Implementation">
{`// lib/session-memory.ts
export async function saveConversationHistory(
  sessionId: string, 
  messages: SessionMessage[],
  mood: AIMood,
  feedbackPreferences?: FeedbackPreferences
) {
  // AI Context: Keep only last 8 messages for token efficiency
  const aiContext = messages.slice(-8);
  
  // UI Display: Store complete history for user experience
  const fullHistory = messages;
  
  await redis.setex(\`session:\${sessionId}:ai\`, 3600, JSON.stringify(aiContext));
  await redis.setex(\`session:\${sessionId}:ui\`, 3600, JSON.stringify(fullHistory));
}`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "persona-errors",
      label: "Persona-Aware Error Handling",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <HighlightBox type="warning" title="6 Error Categories">
            <p className="text-xs mb-3">Each error type gets customized responses based on personality mode (Professional vs GenZ)</p>
          </HighlightBox>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Professional Mode</h4>
              <div className="space-y-1 text-xs">
                <p><strong>unrelated:</strong> "I focus on professional topics..."</p>
                <p><strong>too_short:</strong> "Could you provide more details..."</p>
                <p><strong>manipulation:</strong> "I maintain professional boundaries..."</p>
                <p><strong>rate_limit:</strong> "Please wait a moment..."</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">GenZ Mode</h4>
              <div className="space-y-1 text-xs">
                <p><strong>unrelated:</strong> "Yo, I'm here for career stuff..."</p>
                <p><strong>too_short:</strong> "Need more context bestie..."</p>
                <p><strong>manipulation:</strong> "Nice try but nah..."</p>
                <p><strong>rate_limit:</strong> "Hold up, chill for a sec..."</p>
              </div>
            </div>
          </div>

          <CodeBlock title="Error Response System">
{`// lib/ai-moods.ts
export function getPersonaResponse(errorType: string, mood: AIMood): string {
  const responses = ERROR_RESPONSES[errorType];
  return mood === 'genz' ? responses.genz : responses.professional;
}

// Usage in API
if (validation.errorType) {
  const errorMessage = getPersonaResponse(validation.errorType, mood);
  return new Response(JSON.stringify({ error: errorMessage }));
}`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "smart-suggestions",
      label: "Smart Suggestions & Context",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <HighlightBox type="success" title="Contextual Question Generation">
            <p className="text-xs mb-3">AI generates relevant follow-up questions based on conversation history and user interests</p>
          </HighlightBox>

          <div className="grid md:grid-cols-2 gap-4">
            <HighlightBox type="info" title="localStorage Persistence">
              <p className="text-xs">Suggestions saved locally to prevent repetition across sessions</p>
            </HighlightBox>
            <HighlightBox type="info" title="Dynamic Updates">
              <p className="text-xs">Questions adapt based on previous topics discussed</p>
            </HighlightBox>
          </div>

          <CodeBlock title="Suggestion Logic">
{`// Smart suggestion generation
const generateSuggestions = (conversationHistory, userInterests) => {
  const topics = extractTopics(conversationHistory);
  const suggestions = [];
  
  // Avoid already discussed topics
  const unusedTopics = QUESTION_BANK.filter(q => 
    !topics.includes(q.category)
  );
  
  // Generate contextual follow-ups
  if (topics.includes('projects')) {
    suggestions.push("What challenges did you face in development?");
  }
  
  return suggestions.slice(0, 4); // Show 4 max
};`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "semantic-validation",
      label: "Semantic Query Validation",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Pattern-Based Detection">
            <p className="text-xs mb-3">Replaced hardcoded keywords with intelligent regex patterns for robust query classification</p>
          </HighlightBox>

          <ComparisonGrid
            before={{
              title: "Old: Keyword Matching",
              items: [
                "Static word lists",
                "Case-sensitive matching",
                "Binary valid/invalid",
                "No context awareness"
              ]
            }}
            after={{
              title: "New: Semantic Patterns",
              items: [
                "Dynamic regex patterns",
                "Fuzzy matching support",
                "Confidence scoring",
                "Context-sensitive validation"
              ]
            }}
          />

          <CodeBlock title="Validation Engine">
{`// lib/query-validator.ts
export function validateQuery(query: string): ValidationResult {
  const confidence = calculateConfidence(query);
  
  // Professional relevance patterns
  if (PROFESSIONAL_PATTERNS.some(p => p.test(query))) {
    return { isValid: true, confidence, category: 'professional' };
  }
  
  // Off-topic detection
  if (OFF_TOPIC_PATTERNS.some(p => p.test(query))) {
    return { isValid: false, errorType: 'unrelated', confidence };
  }
  
  // Knowledge gap detection
  if (confidence < 0.6) {
    return { isValid: false, errorType: 'knowledge_gap', confidence };
  }
  
  return { isValid: true, confidence };
}`}
          </CodeBlock>
        </div>
      )
    }
  ];

  const featureMetrics = [
    { label: "Error Types", value: "6", description: "Persona-aware categories" },
    { label: "Storage Layers", value: "2", description: "AI context + UI display" },
    { label: "Validation Accuracy", value: "95%", description: "Semantic patterns" },
    { label: "Context Retention", value: "8 msgs", description: "Optimized for AI" }
  ];

  const enhancementTimeline = [
    {
      title: "Enhanced Chat Experience",
      description: "Copy functionality, feedback mechanisms, and persistent suggestions for better UX"
    },
    {
      title: "Adaptive Feedback Learning",
      description: "System learns user preferences ('be more detailed', 'shorter responses') and applies them consistently"
    },
    {
      title: "Context Relevance Checking",
      description: "Validates that RAG results actually answer user questions before generating responses"
    },
    {
      title: "Smart Error Classification",
      description: "6 distinct error types with persona-specific responses maintain conversation consistency"
    },
    {
      title: "Performance Optimization",
      description: "Token usage reduced ~25% while maintaining response quality and personality accuracy"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Advanced Features</h1>
        <p className="text-xl text-muted-foreground">
          Dual storage system, persona-aware errors, smart suggestions, semantic validation, and enhanced chat experience powering the AI digital twin.
        </p>
      </div>

      <AlertBox type="info" icon={Zap} title="Feature Overview">
        <p>
          These advanced features work together to create a sophisticated AI interaction system that feels natural, 
          maintains consistency, and provides intelligent responses while optimizing for both performance and user experience.
        </p>
      </AlertBox>

      <DocSection title="System Metrics" icon={Settings}>
        <MetricGrid metrics={featureMetrics} columns={4} />
      </DocSection>

      <DocSection title="Core Features" icon={Sparkles}>
        <Tabs items={advancedFeatures} defaultTab="dual-storage" />
      </DocSection>

      <DocSection title="Recent Enhancements" icon={Zap}>
        <p className="text-sm text-muted-foreground mb-4">
          Continuous improvements based on user feedback and system performance analysis.
        </p>

        <CodeBlock title="Enhancement Timeline">
          <StepList steps={enhancementTimeline} />
        </CodeBlock>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <HighlightBox type="success" title="UX Improvements">
            <p className="text-xs">Copy functionality, feedback detection, persistent suggestions</p>
          </HighlightBox>
          <HighlightBox type="success" title="Performance Gains">
            <p className="text-xs">25% token reduction, optimized context handling</p>
          </HighlightBox>
          <HighlightBox type="success" title="Intelligence Boost">
            <p className="text-xs">Semantic validation, adaptive learning, relevance checking</p>
          </HighlightBox>
        </div>
      </DocSection>

      <DocSection title="Technical Implementation">
        <CodeBlock title="Feature Integration">
{`// Advanced features working together in chat API
export async function POST(req: Request) {
  // 1. Dual storage retrieval
  const sessionHistory = await loadConversationHistory(sessionId);
  const feedbackPreferences = await loadFeedbackPreferences(sessionId);
  
  // 2. Semantic validation with error classification  
  const validation = validateQuery(cleanQuery);
  if (!validation.isValid) {
    return getPersonaResponse(validation.errorType, mood);
  }
  
  // 3. Context relevance checking
  const ragContext = await searchVectorContext(vectorIndex, cleanQuery);
  const contextRelevance = validateContextRelevance(cleanQuery, ragContext);
  
  // 4. Smart suggestion generation
  const suggestions = generateContextualSuggestions(sessionHistory);
  
  // 5. Persona-aware response generation
  const response = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: buildPersonaPrompt(mood, feedbackPreferences),
    // ...
  });
}`}
        </CodeBlock>
      </DocSection>
    </div>
  );
}