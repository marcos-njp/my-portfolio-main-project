# Documentation Sections Organization

This directory contains all documentation sections for the AI-powered portfolio, now organized into logical categories for better maintainability.

## 📁 Directory Structure

```
sections/
├── core/                    # Core architecture & concepts
│   ├── RagArchitectureSection.tsx
│   ├── PersonalitySystemSection.tsx
│   └── ProfileDataSection.tsx
│
├── technical/              # Technical implementation details
│   ├── AdvancedFeaturesSection.tsx
│   ├── LibUtilitiesSection.tsx
│   └── McpIntegrationSection.tsx
│
├── guides/                 # How-to guides & operations
│   ├── OperationsSection.tsx
│   ├── TestingSection.tsx
│   └── GithubSection.tsx
│
└── index.ts               # Centralized exports
```

## 📚 Section Categories

### Core Architecture (`core/`)
**Focus:** Fundamental concepts and system design

- **RagArchitectureSection** - RAG system design, Groq AI integration, Upstash Vector database, semantic search
- **PersonalitySystemSection** - Anti-generic response system, personality leak prevention, mood validation
- **ProfileDataSection** - STAR methodology, structured data organization, professional profile architecture

### Technical Implementation (`technical/`)
**Focus:** Code-level implementation and utilities

- **AdvancedFeaturesSection** - Dual personality modes, session memory, query preprocessing, feedback detection
- **LibUtilitiesSection** - Complete guide to all 13 lib utilities (ai-moods, rag-utils, session-memory, etc.)
- **McpIntegrationSection** - Model Context Protocol setup, tool calling, Claude Desktop integration

### Guides & Operations (`guides/`)
**Focus:** Practical guides and troubleshooting

- **OperationsSection** - Common errors, solutions, debugging workflows, lessons learned
- **TestingSection** - AI improvements timeline, streaming UX, feedback implementation, performance optimization
- **GithubSection** - All project repositories with tech stacks, demos, and GitHub links

## 🔄 Import Pattern

All sections are exported through `index.ts` for clean imports:

```tsx
import {
  // Core
  RagArchitectureSection,
  PersonalitySystemSection,
  ProfileDataSection,
  
  // Technical
  AdvancedFeaturesSection,
  LibUtilitiesSection,
  McpIntegrationSection,
  
  // Guides
  OperationsSection,
  TestingSection,
  GithubSection,
} from "@/components/docs/sections";
```

## 📝 Adding New Sections

1. Determine category (core/technical/guides)
2. Create component in appropriate subdirectory
3. Add export to `index.ts` under correct category
4. Update `app/docs/content.tsx` with route and metadata

## 🎯 Design Principles

- **Separation of Concerns:** Each category serves distinct purpose
- **Discoverability:** Logical grouping makes finding docs easier
- **Maintainability:** Related sections grouped together
- **Scalability:** Easy to add new sections without clutter

## 📊 Current Stats

- **Total Sections:** 9
- **Core:** 3 sections
- **Technical:** 3 sections
- **Guides:** 3 sections
- **Lines of Documentation:** ~3,000+ lines

---

Last Updated: November 28, 2025
