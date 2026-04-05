# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components based on natural language descriptions, with a virtual file system for in-memory component storage and a live preview system.

**Tech Stack:**
- Next.js 15 (App Router) with React 19
- TypeScript
- Tailwind CSS v4
- Prisma (SQLite)
- Anthropic Claude AI via Vercel AI SDK
- Vitest for testing

## Development Commands

### Initial Setup
```bash
npm run setup
```
This runs installation, Prisma client generation, and database migrations.

### Development Server
```bash
npm run dev                # Standard development mode
npm run dev:daemon         # Background mode (logs to logs.txt)
```
Development server runs on http://localhost:3000

### Database Operations
```bash
npx prisma generate        # Generate Prisma client (output: src/generated/prisma)
npx prisma migrate dev     # Run migrations
npm run db:reset          # Reset database (destructive)
```

### Code Quality
```bash
npm run lint              # ESLint
npm run test              # Run Vitest tests
```

### Build & Production
```bash
npm run build             # Production build
npm start                 # Start production server
```

### Running Single Tests
```bash
npm test -- <test-file-path>
npm test -- src/components/chat/__tests__/MessageList.test.tsx
```

## Architecture

### Core Architectural Concepts

**Virtual File System (VFS)**
- In-memory file management via `VirtualFileSystem` class (src/lib/file-system.ts)
- Files are NOT written to disk; all component code exists in memory
- VFS state is serialized to JSON and stored in Prisma Project.data field
- VFS methods: `writeFile()`, `readFile()`, `deleteNode()`, `listDirectory()`
- File nodes have type `FileNode` with `type`, `name`, `path`, `content`, and `children`

**AI Chat Integration**
- Chat route: src/app/api/chat/route.ts
- Uses Vercel AI SDK's `streamText()` with custom tools
- System prompt from src/lib/prompts/generation.ts
- AI tools: `str_replace_editor` (edit files) and `file_manager` (create/delete files)
- Mock provider used when ANTHROPIC_API_KEY is not set (returns static code)

**Component Preview System**
- Preview components transpiled in-browser using @babel/standalone
- Preview rendered in isolated iframe
- File changes trigger hot reload of preview

**Authentication & Projects**
- JWT-based auth (src/lib/auth.ts)
- Anonymous users tracked via cookies (src/lib/anon-work-tracker.ts)
- Projects tied to users OR anonymous sessions
- Project persistence: messages and VFS stored as JSON strings in Prisma

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/chat/          # AI chat endpoint
│   ├── [projectId]/       # Project-specific pages
│   └── page.tsx           # Home page
├── components/
│   ├── chat/              # Chat interface components
│   └── ui/                # Radix UI components
├── lib/
│   ├── file-system.ts     # VirtualFileSystem class
│   ├── provider.ts        # AI model provider (real + mock)
│   ├── auth.ts            # JWT authentication
│   ├── tools/             # AI tools (str-replace, file-manager)
│   ├── contexts/          # React contexts (chat, file-system)
│   └── prompts/           # AI system prompts
├── actions/               # Next.js Server Actions
└── hooks/                 # React hooks

prisma/
├── schema.prisma          # Database schema (User, Project models)
└── dev.db                # SQLite database
```

### Key Data Flow

1. **User Prompt → AI Generation:**
   - User message sent to POST /api/chat
   - VFS deserialized from Project.data
   - Message history + VFS context sent to Claude
   - AI uses tools to create/modify files in VFS
   - Streaming response sent back to client

2. **VFS Serialization:**
   - VFS state serialized via `serializeToNodes()` → flat object
   - Stored as JSON string in `Project.data` column
   - Deserialized via `deserializeFromNodes()` on load

3. **Preview Rendering:**
   - VFS files read from context
   - JSX/TSX transpiled to JS via Babel in browser
   - Executed in iframe with React runtime

## Important Implementation Notes

### Working with the VFS
- Always use VirtualFileSystem methods; never attempt real file I/O for generated components
- VFS paths are normalized (always start with `/`)
- When modifying VFS in AI tools, serialize and save to Project.data

### Prisma Client Location
- Generated client: `src/generated/prisma` (not default node_modules location)
- Import: `import { prisma } from '@/lib/prisma'`
- After schema changes: run `npx prisma generate` before restarting dev server

### AI Provider Configuration
- Real provider requires `ANTHROPIC_API_KEY` in .env
- Without key, MockLanguageModel returns static component code
- Mock provider uses fewer maxSteps (4 vs 40) to prevent repetition

### Testing
- Tests use Vitest + Testing Library
- Tests located in `__tests__` directories alongside components
- Run specific test file: `npm test -- <path>`

### Node Compatibility
- `node-compat.cjs` polyfill required for Next.js dev server
- All npm scripts use `NODE_OPTIONS='--require ./node-compat.cjs'`

## API Key Management
The `.env` file contains the Anthropic API key. If missing, the app runs in mock mode with static responses instead of real AI generation.
- Use comments sparingly, only comment complex code.
- the database structure is in the @prisma/schema.prisma, reference it anytime if you need to know the structure of data stored in the database.