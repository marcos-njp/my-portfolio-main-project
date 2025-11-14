'use server'

import { chatTool, chatSchema, type ChatParams } from "@/lib/chat-mcp"
import { resolveApiDomain } from "@/lib/url-resolver"

/**
 * Server action that provides chat functionality for MCP
 */
export async function chatWithDigitalTwin(params: ChatParams) {
  try {
    const validated = chatSchema.parse(params);
    
    // Call the existing chat API route
    const apiDomain = resolveApiDomain();
    const response = await fetch(`${apiDomain}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: validated.message }],
        mood: validated.mood || 'professional',
        sessionId: validated.sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: {
          code: -32603,
          message: error.message || 'Chat API request failed',
        },
      };
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
      success: true,
      result: {
        content: [{
          type: 'text' as const,
          text: fullResponse || 'No response received',
        }],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: -32602,
        message: error instanceof Error ? error.message : 'Invalid parameters',
      },
    };
  }
}

/**
 * List available MCP tools
 */
export async function listMcpTools() {
  return {
    success: true,
    result: {
      tools: [
        {
          name: chatTool.name,
          description: chatTool.description,
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to send to the digital twin',
                minLength: 1,
                maxLength: 1000,
              },
              mood: {
                type: 'string',
                description: 'The mood/tone for the response (professional, casual, genz)',
                enum: ['professional', 'casual', 'genz'],
                default: 'professional',
              },
              sessionId: {
                type: 'string',
                description: 'Optional session ID for conversation continuity',
              },
            },
            required: ['message'],
          },
        },
      ],
    },
  };
}
