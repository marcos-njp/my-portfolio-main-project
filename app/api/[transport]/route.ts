// app/api/[transport]/route.ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { chatTool } from "@/lib/chat-mcp";
import { resolveApiDomain } from "@/lib/url-resolver";

// Define schema inline without chained optional/default
const chatParamsShape = {
  message: z.string().min(1).max(1000),
  mood: z.enum(['professional', 'casual', 'genz']).optional(),
  sessionId: z.string().optional(),
};

const handler = createMcpHandler(
  (server) => {
    server.tool(
      chatTool.name,
      chatTool.description,
      chatParamsShape,
      async ({ message, mood, sessionId }) => {
        // Set defaults for optional parameters
        const actualMood = mood || 'professional';
        const actualSessionId = sessionId || undefined;
        
        // Call the existing chat API route
        const apiDomain = resolveApiDomain();
        const response = await fetch(`${apiDomain}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
            mood: actualMood,
            sessionId: actualSessionId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Chat API request failed');
        }

        // Read the streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullResponse += decoder.decode(value, { stream: true });
          }
        }

        return {
          content: [{
            type: 'text' as const,
            text: fullResponse || 'No response received',
          }],
        };
      }
    );
  },
  {
    // Server options
  },
  {
    // No Redis config - disable Redis requirement
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
