import { Code, CheckCircle, ExternalLink, Plug, Server, Zap } from "lucide-react";
import { 
  DocSection, 
  AlertBox, 
  StepList, 
  CodeBlock,
  MetricGrid,
  HighlightBox,
  Tabs 
} from "@/components/docs/common";

export function McpIntegrationSection() {
  const mcpFlow = [
    {
      title: "Client Request",
      description: "Claude Desktop or other MCP client sends HTTP POST to https://m-njp.vercel.app/api/mcp"
    },
    {
      title: "Transport Layer", 
      description: "MCP handler validates request format, extracts tool calls, and forwards to chat API",
      content: <code className="text-xs bg-muted px-2 py-1 rounded">app/api/[transport]/route.ts</code>
    },
    {
      title: "Chat Processing",
      description: "Consolidated pipeline: typo correction → feedback detection → validation → RAG search → persona-aware AI generation"
    },
    {
      title: "Response Formatting",
      description: "Convert streaming AI response to MCP protocol format with proper tool result structure"
    },
    {
      title: "Client Delivery",
      description: "Structured JSON response sent back to Claude Desktop with conversation context"
    }
  ];

  const mcpMetrics = [
    { label: "Protocol", value: "HTTP", description: "RESTful communication" },
    { label: "Endpoint", value: "/api/mcp", description: "Single route handler" },
    { label: "Deployment", value: "Vercel Edge", description: "Global distribution" },
    { label: "Transport", value: "JSON", description: "Structured messaging" }
  ];

  const setupTabs = [
    {
      id: "configuration", 
      label: "Configuration",
      icon: Code,
      content: (
        <div className="space-y-4">
          <CodeBlock title="Claude Desktop Configuration">
{`"mcpServers": {
    "digital-twin-production": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://m-njp.vercel.app/api/mcp"
      ]
    }
  }`}
          </CodeBlock>

          <HighlightBox type="info" title="Quick Setup">
            <p className="text-xs mb-2">Add the server configuration to your Claude Desktop settings:</p>
            <p className="text-xs">📁 ~/.config/claude-desktop/config.json (macOS/Linux)</p>
            <p className="text-xs">📁 %APPDATA%/Claude/config.json (Windows)</p>
          </HighlightBox>
        </div>
      )
    },
    {
      id: "tools",
      label: "Available Tools", 
      icon: Plug,
      content: (
        <div className="space-y-4">
          <HighlightBox type="success" title="chat_with_digital_twin">
            <p className="text-xs mb-2">Primary tool for conversing with the AI digital twin. Features adaptive feedback learning, consolidated validation, and persona-aware responses.</p>
            <div className="space-y-1 text-xs">
              <p><strong>Parameters:</strong></p>
              <p>• message (required): Your question or conversation</p>
              <p>• mood (optional): &ldquo;professional&rdquo; or &ldquo;genz&rdquo;</p> 
              <p>• sessionId (optional): Conversation continuity & feedback preferences</p>
            </div>
          </HighlightBox>

          <CodeBlock title="Tool Usage Example">
{`// Claude Desktop can now call:
chat_with_digital_twin({
  message: "Tell me about your AI projects",
  mood: "professional"
})

// Which returns structured response:
{
  "response": "I built an AI-Powered Portfolio with RAG using Next.js 15...",
  "mood": "professional",
  "sessionId": "session_xyz",
  "context": "AI Projects, Technical Implementation"
}`}
          </CodeBlock>
        </div>
      )
    },
    {
      id: "testing",
      label: "Testing & Validation",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <HighlightBox type="tip" title="Manual Testing">
            <p className="text-xs mb-2">Test the MCP endpoint directly with curl:</p>
            <CodeBlock>
{`curl -X POST https://m-njp.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "tools/call",
    "params": {
      "name": "chat_with_digital_twin",
      "arguments": {
        "message": "What are your main projects?",
        "mood": "professional"
      }
    }
  }'`}
            </CodeBlock>
          </HighlightBox>

          <div className="grid md:grid-cols-2 gap-4">
            <HighlightBox type="success" title="Expected Response">
              <p className="text-xs">✅ Structured JSON with AI response</p>
              <p className="text-xs">✅ Proper MCP protocol formatting</p>
              <p className="text-xs">✅ Session continuity maintained</p>
            </HighlightBox>
            <HighlightBox type="warning" title="Error Handling">
              <p className="text-xs">⚠️ Persona-aware error responses</p>
              <p className="text-xs">⚠️ Rate limiting protection</p>
              <p className="text-xs">⚠️ Graceful timeout handling</p>
            </HighlightBox>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">MCP Integration</h1>
        <p className="text-xl text-muted-foreground">
          Model Context Protocol implementation enabling AI agents to interact with the digital twin seamlessly.
        </p>
      </div>

      <AlertBox type="info" icon={Plug} title="What is MCP?">
        <p>
          The Model Context Protocol (MCP) is an open standard that enables AI applications to communicate with 
          external data sources and tools. This integration allows Claude Desktop and other MCP-compatible clients 
          to query the digital twin portfolio directly.
        </p>
      </AlertBox>

      <DocSection title="System Overview" icon={Server}>
        <MetricGrid metrics={mcpMetrics} columns={4} />
      </DocSection>

      <DocSection title="MCP Server Architecture" icon={Code}>
        <CodeBlock title="Request Flow">
          <StepList steps={mcpFlow} />
        </CodeBlock>

        <HighlightBox type="info" title="Integration Benefits" className="mt-4">
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-medium">For Developers</p>
              <p>• Direct Claude Desktop integration</p>
              <p>• No additional authentication needed</p>
              <p>• Seamless conversation flow</p>
            </div>
            <div>
              <p className="font-medium">For Users</p>
              <p>• Natural language portfolio queries</p>
              <p>• Consistent personality across platforms</p>
              <p>• Rich, contextual responses</p>
            </div>
          </div>
        </HighlightBox>
      </DocSection>

      <DocSection title="Setup & Configuration" icon={Zap}>
        <Tabs items={setupTabs} defaultTab="configuration" />
      </DocSection>

      <DocSection title="Implementation Details">
        <CodeBlock title="MCP Handler Structure">
{`// app/api/[transport]/route.ts
export async function POST(request: Request) {
  const mcpRequest = await request.json();
  
  // Extract tool call from MCP format
  const { name, arguments: args } = mcpRequest.params;
  
  if (name === 'chat_with_digital_twin') {
    // Forward to standard chat API
    const response = await handleChatRequest(args);
    
    // Convert to MCP protocol format
    return Response.json({
      jsonrpc: "2.0",
      id: mcpRequest.id,
      result: {
        content: [{
          type: "text", 
          text: response
        }]
      }
    });
  }
}`}
        </CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <HighlightBox type="success" title="Protocol Compliance">
            <p className="text-xs">Full MCP 2.0 specification support with proper JSON-RPC formatting</p>
          </HighlightBox>
          <HighlightBox type="success" title="Error Handling">
            <p className="text-xs">Graceful degradation with persona-aware error responses</p>
          </HighlightBox>
        </div>
      </DocSection>

      <DocSection title="External Resources">
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://modelcontextprotocol.io/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">MCP Protocol Documentation</p>
              <p className="text-xs text-muted-foreground">Official specification and guides</p>
            </div>
          </a>
          <a
            href="https://github.com/modelcontextprotocol"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">MCP GitHub Repository</p>
              <p className="text-xs text-muted-foreground">SDKs and example implementations</p>
            </div>
          </a>
        </div>
      </DocSection>
    </div>
  );
}