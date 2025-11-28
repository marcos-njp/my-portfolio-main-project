import { Database, CheckCircle, Zap, Search, Brain, Shield } from "lucide-react";
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

export function RagArchitectureSection() {
  const architectureFlow = [
    {
      title: "Query Preprocessing",
      description: "Typo correction, fuzzy matching, and query normalization for better search accuracy"
    },
    {
      title: "Semantic Query Validation", 
      description: "Dynamic regex patterns detect professional queries with errorType returns for persona-aware responses",
      content: (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          validation.errorType // Returns: unrelated, too_short, manipulation, etc.
        </code>
      )
    },
    {
      title: "Vector Search",
      description: "Semantic search in Upstash Vector with topK=2-3, minScore=0.75 (75% relevance threshold)",
      content: (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          const results = await vectorIndex.query(embedding, {`{topK: 3, minScore: 0.75}`})
        </code>
      )
    },
    {
      title: "Context Assembly",
      description: "Session memory + RAG results + personality rules combined for comprehensive context"
    },
    {
      title: "AI Generation",
      description: "Groq AI streaming with personality validation and error handling"
    },
    {
      title: "Response Validation",
      description: "Quality checks and persona consistency verification before delivery"
    }
  ];

  const systemMetrics = [
    { label: "AI Model", value: "Groq AI", description: "llama-3.1-8b-instant" },
    { label: "Vector DB", value: "Upstash", description: "Serverless semantic search" },
    { label: "Response Time", value: "<2s", description: "Streaming support" },
    { label: "Relevance Score", value: "0.75+", description: "75% threshold" }
  ];

  const validationPatterns = [
    {
      name: "Professional Queries",
      pattern: "/(experience|project|skill|tech|background)/i",
      result: "Valid - proceeds to RAG search"
    },
    {
      name: "Too Short/Unclear",
      pattern: "/^.{1,10}$/",
      result: "too_short - persona-aware error response"
    },
    {
      name: "Unrelated Content", 
      pattern: "/(weather|recipe|movie|game)/i",
      result: "unrelated - polite redirection"
    },
    {
      name: "Manipulation Attempts",
      pattern: "/(ignore|forget|pretend|roleplay)/i", 
      result: "manipulation - firm boundary response"
    }
  ];

  const ragComponents = [
    {
      id: "groq",
      label: "Groq AI",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Model Configuration">
            <p className="text-xs mb-2">llama-3.1-8b-instant - Optimized for speed and accuracy</p>
            <div className="space-y-1">
              <p>• Temperature: 0.7 (Professional) / 0.9 (GenZ)</p>
              <p>• Max tokens: 1000</p>
              <p>• Streaming: Enabled for real-time response</p>
            </div>
          </HighlightBox>
          
          <CodeBlock title="Integration">
{`import { createGroq } from '@ai-sdk/groq';
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const { textStream } = await streamText({
  model: groq('llama-3.1-8b-instant'),
  messages: [systemPrompt, ...conversationHistory, userMessage],
  temperature: mood === 'professional' ? 0.7 : 0.9
});`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "vector",
      label: "Upstash Vector", 
      icon: Database,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Vector Database Setup">
            <p className="text-xs mb-2">Serverless vector database for semantic search</p>
            <div className="space-y-1">
              <p>• Embedding model: text-embedding-3-small</p>
              <p>• Dimensions: 1536</p>
              <p>• Distance metric: Cosine similarity</p>
            </div>
          </HighlightBox>
          
          <CodeBlock title="Search Implementation">
{`const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN
});

const results = await vectorIndex.query({
  vector: embedding,
  topK: 3,
  minScore: 0.75,
  includeMetadata: true
});`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "validation",
      label: "Semantic Validation",
      icon: Shield, 
      content: (
        <div className="space-y-4">
          <HighlightBox type="warning" title="Query Pattern Detection">
            <p className="text-xs mb-2">Dynamic regex patterns replace hardcoded keyword matching</p>
          </HighlightBox>
          
          <div className="space-y-3">
            {validationPatterns.map((pattern, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{pattern.name}</h4>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{pattern.result.split(' - ')[0]}</span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block mb-1">{pattern.pattern}</code>
                <p className="text-xs text-muted-foreground">{pattern.result}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">RAG Architecture</h1>
        <p className="text-xl text-muted-foreground">
          Technical deep dive into the Retrieval-Augmented Generation system powering the AI digital twin.
        </p>
      </div>

      <DocSection title="System Overview" icon={Database}>
        <p className="text-sm text-muted-foreground mb-4">
          The RAG system combines real-time vector search with large language model generation to provide accurate, 
          context-aware responses about professional background, skills, and experience.
        </p>
        
        <MetricGrid metrics={systemMetrics} columns={4} />
      </DocSection>

      <DocSection title="Request Flow" icon={Zap}>
        <CodeBlock title="Complete Pipeline">
          <StepList steps={architectureFlow} />
        </CodeBlock>
      </DocSection>

      <DocSection title="Core Components">
        <Tabs items={ragComponents} defaultTab="groq" />
      </DocSection>

      <DocSection title="Semantic Validation System" icon={Search}>
        <p className="text-sm text-muted-foreground mb-4">
          Advanced query validation replaces hardcoded keyword matching with intelligent pattern detection 
          for context-sensitive error handling.
        </p>

        <ComparisonGrid
          before={{
            title: "Before: Hardcoded Keywords",
            items: [
              "Static keyword lists",
              "Binary valid/invalid responses", 
              "No context awareness",
              "Generic error messages",
              "Brittle pattern matching"
            ]
          }}
          after={{
            title: "After: Semantic Validation",
            items: [
              "Dynamic regex patterns",
              "6 distinct error types", 
              "Context-aware responses",
              "Persona-specific error handling",
              "Robust semantic analysis"
            ]
          }}
        />

        <CodeBlock title="Implementation" className="mt-4">
{`// lib/query-validator.ts
export function validateQuery(query: string): ValidationResult {
  // Pattern-based validation with error type classification
  if (MANIPULATION_PATTERNS.test(query)) return { errorType: 'manipulation' };
  if (query.length < 10) return { errorType: 'too_short' };
  if (UNRELATED_PATTERNS.test(query)) return { errorType: 'unrelated' };
  
  return { isValid: true };
}

// Usage in API
const validation = validateQuery(query);
if (validation.errorType) {
  return getPersonaResponse(validation.errorType, mood);
}`}
        </CodeBlock>
      </DocSection>

      <DocSection title="Performance & Accuracy" icon={CheckCircle}>
        <div className="grid md:grid-cols-2 gap-4">
          <HighlightBox type="success" title="Search Accuracy">
            <p className="text-xs">75% relevance threshold with 65% fallback ensures high-quality results</p>
          </HighlightBox>
          <HighlightBox type="success" title="Response Speed">
            <p className="text-xs">Streaming responses with &lt;2s initial token delivery</p>
          </HighlightBox>
          <HighlightBox type="success" title="Context Quality">
            <p className="text-xs">Dual storage system optimizes both AI context and user experience</p>
          </HighlightBox>
          <HighlightBox type="success" title="Error Handling">
            <p className="text-xs">6 error types with persona-aware responses maintain consistency</p>
          </HighlightBox>
        </div>

        <AlertBox type="info" title="Technical Specifications" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <p className="font-medium">Vector Dimensions</p>
              <p>1536 (OpenAI embedding)</p>
            </div>
            <div>
              <p className="font-medium">Search TopK</p>
              <p>2-3 results</p>
            </div>
            <div>
              <p className="font-medium">Min Score</p>
              <p>0.75 (0.65 fallback)</p>
            </div>
            <div>
              <p className="font-medium">Response TTL</p>
              <p>1 hour (Redis)</p>
            </div>
          </div>
        </AlertBox>
      </DocSection>
    </div>
  );
}