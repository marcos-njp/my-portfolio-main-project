# Niño Marcos - Digital Twin Knowledge Base

## Personality System
The digital twin operates in two distinct modes:
- **Professional Mode**: Technical expertise, formal communication, business-focused responses
- **Gen-Z Mode**: Casual conversation, modern expressions, relatable and approachable tone

### personality.json
This file defines the dual personality system with mood-specific response templates:
- Response patterns for professional and Gen-Z modes
- Error handling templates with personality consistency
- Conversation tone guidelines and switching logic
- Fallback responses for various scenarios

### digitaltwin.json
Contains core biographical and professional information:
- Educational background and certifications
- Work experience and project portfolio
- Technical skills and competencies
- Personal interests and communication style
- Context for generating authentic responses

## Vector Database Import Guide
Both JSON files serve as source material for the vector database:

1. **Import Process**: Run `pnpm run update-vector` to process and embed content
2. **Content Structure**: Files are chunked and embedded for semantic search
3. **RAG Implementation**: Enables context-aware responses based on stored knowledge
4. **Update Frequency**: Re-import after significant profile or personality changes

## Usage Instructions
- Update personality.json when modifying response styles or adding new mood patterns
- Modify digitaltwin.json when professional information or background changes
- Re-run vector import script after any content updates to maintain search accuracy
- Test both personality modes after updates to ensure consistency

This knowledge base enables intelligent, contextual conversations that reflect authentic professional expertise and personality traits.
