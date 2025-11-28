import { Code, Database, Sparkles, Shield, Zap, FileCode, Brain, Search } from "lucide-react";
import { 
  DocSection, 
  AlertBox, 
  CodeBlock,
  MetricGrid,
  HighlightBox,
  Tabs 
} from "@/components/docs/common";

export function LibUtilitiesSection() {
  const utilityModules = [
    {
      id: "ai-moods",
      label: "AI Moods",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Personality & Conversation Styles">
            <p className="text-xs mb-2">Manages AI personality configurations with mood-aware error handling</p>
            <div className="space-y-1 text-xs">
              <p>• Professional Mode: Interview-ready, clear, and kind for recruiters</p>
              <p>• GenZ Mode: Casual, slang-filled, emoji-rich texting vibe</p>
              <p>• Error Handling: 6 persona-aware error types</p>
            </div>
          </HighlightBox>

          <CodeBlock title="Usage">
{`import { getMoodConfig, getPersonaResponse } from '@/lib/ai-moods';

const config = getMoodConfig('professional');
console.log(config.temperature); // 0.7

const errorResponse = getPersonaResponse('unrelated', 'genz');
// Returns: "yo that's not really about me or my work..."`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "session-memory",
      label: "Session Memory",
      icon: Database,
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="Dual Storage Architecture">
            <p className="text-xs mb-2">Redis-backed dual storage system for optimal AI performance</p>
            <div className="space-y-1 text-xs">
              <p>• Session Memory: Last 8 messages for AI context</p>
              <p>• Chat History: Complete conversation for UI display</p>
              <p>• TTL: 1 hour auto-cleanup</p>
            </div>
          </HighlightBox>

          <CodeBlock title="Implementation">
{`import { saveConversationHistory, loadConversationHistory } from '@/lib/session-memory';

// Save to both storages
await saveConversationHistory(sessionId, messages);

// Load AI context (8 messages)
const context = await loadConversationHistory(sessionId);

// Load complete UI history
const fullHistory = await loadChatHistory(sessionId);`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "query-validator",
      label: "Query Validation",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <HighlightBox type="warning" title="Semantic Query Patterns">
            <p className="text-xs mb-2">Dynamic regex patterns replace hardcoded keyword matching</p>
            <div className="space-y-1 text-xs">
              <p>• Professional query detection</p>
              <p>• Manipulation attempt blocking</p>
              <p>• Context-sensitive error classification</p>
            </div>
          </HighlightBox>

          <CodeBlock title="Validation Flow">
{`import { validateQuery } from '@/lib/query-validator';

const validation = validateQuery(userMessage);
if (validation.errorType) {
  return getPersonaResponse(validation.errorType, mood);
}
// Continue with RAG search...`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "rag-utils",
      label: "RAG Utilities", 
      icon: Search,
      content: (
        <div className="space-y-4">
          <HighlightBox type="success" title="Semantic Search & Processing">
            <p className="text-xs mb-2">Upstash Vector integration with intelligent query preprocessing</p>
            <div className="space-y-1 text-xs">
              <p>• Vector search with 75% relevance threshold</p>
              <p>• Query preprocessing and typo correction</p>
              <p>• Context assembly for AI generation</p>
            </div>
          </HighlightBox>

          <CodeBlock title="RAG Pipeline">
{`import { performRAGSearch, preprocessQuery } from '@/lib/rag-utils';

// Preprocess and search
const enhancedQuery = preprocessQuery(query);
const results = await performRAGSearch(enhancedQuery);

// Assemble context
const context = buildRAGContext(results, conversationHistory);`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "response-tools", 
      label: "Response Tools",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <HighlightBox type="tip" title="Response Processing & Validation">
            <p className="text-xs mb-2">Quality assurance and formatting for AI responses</p>
            <div className="space-y-1 text-xs">
              <p>• Response validation and filtering</p>
              <p>• Personality consistency checks</p>
              <p>• Output formatting and cleanup</p>
            </div>
          </HighlightBox>

          <CodeBlock title="Processing Chain">
{`// response-validator.ts, response-manager.ts, feedback-detector.ts
import { validateResponse, formatResponse, detectFeedback } from '@/lib/response-tools';

const validated = validateResponse(aiOutput, mood);
const formatted = formatResponse(validated);
const feedback = detectFeedback(userMessage);`}
          </CodeBlock>
        </div>
      )
    }
  ];

  const libraryMetrics = [
    { label: "Total Modules", value: "13", description: "Specialized utilities" },
    { label: "Core Functions", value: "40+", description: "Exported functions" }, 
    { label: "Type Safety", value: "100%", description: "TypeScript coverage" },
    { label: "Error Handling", value: "6 types", description: "Persona-aware errors" }
  ];

  const keyUtilities = [
    { name: "ai-moods.ts", purpose: "Personality & error handling", exports: "getMoodConfig, getPersonaResponse" },
    { name: "session-memory.ts", purpose: "Dual Redis storage system", exports: "saveConversationHistory, loadChatHistory" },
    { name: "query-validator.ts", purpose: "Semantic query validation", exports: "validateQuery, ValidationResult" },
    { name: "rag-utils.ts", purpose: "Vector search & preprocessing", exports: "performRAGSearch, preprocessQuery" },
    { name: "response-validator.ts", purpose: "AI response validation", exports: "validateResponse, ResponseQuality" },
    { name: "query-preprocessor.ts", purpose: "Query enhancement & typos", exports: "preprocessQuery, expandContext" },
    { name: "feedback-detector.ts", purpose: "User feedback recognition", exports: "detectFeedback, FeedbackType" },
    { name: "interviewer-faqs.ts", purpose: "FAQ pattern matching", exports: "matchFAQ, getQuestionType" },
    { name: "response-manager.ts", purpose: "Response formatting", exports: "formatResponse, cleanOutput" },
    { name: "url-resolver.ts", purpose: "Link validation & metadata", exports: "resolveURL, getLinkPreview" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Lib Utilities Deep Dive</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive guide to all utility modules in lib/ that power intelligent conversations, context management, and AI personality.
        </p>
      </div>

      <AlertBox type="info" icon={FileCode} title="Architecture Overview">
        <p>
          The lib/ directory contains 13 specialized utility modules that handle everything from query preprocessing to response validation. 
          Each module focuses on a specific aspect of the AI chat system, promoting separation of concerns and maintainability.
        </p>
      </AlertBox>

      <DocSection title="Library Overview" icon={Code}>
        <MetricGrid metrics={libraryMetrics} columns={4} />
      </DocSection>

      <DocSection title="Core Modules" icon={Zap}>
        <Tabs items={utilityModules} defaultTab="ai-moods" />
      </DocSection>

      <DocSection title="Complete Module Reference">
        <div className="space-y-3">
          {keyUtilities.map((util, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{util.name}</h4>
                <span className="text-xs bg-muted px-2 py-1 rounded">lib/</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{util.purpose}</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{util.exports}</code>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Integration Patterns">
        <div className="grid md:grid-cols-2 gap-4">
          <HighlightBox type="success" title="Modular Design">
            <p className="text-xs">Each utility focuses on a single responsibility with clear interfaces and type definitions</p>
          </HighlightBox>
          <HighlightBox type="success" title="Error Handling">
            <p className="text-xs">Consistent error handling patterns across all modules with persona-aware responses</p>
          </HighlightBox>
          <HighlightBox type="success" title="Performance">
            <p className="text-xs">Optimized for serverless environments with efficient caching and minimal cold starts</p>
          </HighlightBox>
          <HighlightBox type="success" title="Type Safety">
            <p className="text-xs">Full TypeScript coverage with strict typing for reliable development experience</p>
          </HighlightBox>
        </div>
      </DocSection>

      <DocSection title="Usage Examples">
        <CodeBlock title="Complete Chat Pipeline">
{`// Typical request flow using multiple utilities
import { validateQuery } from '@/lib/query-validator';
import { preprocessQuery, performRAGSearch } from '@/lib/rag-utils';  
import { getMoodConfig, getPersonaResponse } from '@/lib/ai-moods';
import { loadConversationHistory, saveConversationHistory } from '@/lib/session-memory';

export async function handleChatRequest(message: string, mood: AIMood, sessionId: string) {
  // 1. Validate query
  const validation = validateQuery(message);
  if (validation.errorType) {
    return getPersonaResponse(validation.errorType, mood);
  }

  // 2. Load conversation context
  const history = await loadConversationHistory(sessionId);
  
  // 3. Perform RAG search
  const enhanced = preprocessQuery(message);
  const ragResults = await performRAGSearch(enhanced);
  
  // 4. Generate AI response
  const config = getMoodConfig(mood);
  const response = await generateResponse(message, history, ragResults, config);
  
  // 5. Save to memory
  await saveConversationHistory(sessionId, [...history, { message, response }]);
  
  return response;
}`}
        </CodeBlock>
      </DocSection>
    </div>
  );
}