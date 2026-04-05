# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components based on natural language descriptions, displaying them in a real-time preview with a virtual file system (no files are written to disk).

**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma (SQLite), Anthropic Claude AI, Vercel AI SDK

## Development Commands

### Setup & Installation
```bash
npm run setup        # Install dependencies, generate Prisma client, run migrations
npm install          # Install dependencies only
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run database migrations
```

### Running the Application
```bash
npm run dev          # Start development server with Turbopack
npm run dev:daemon   # Start dev server in background (logs to logs.txt)
npm run build        # Production build
npm start            # Start production server
```

### Code Quality & Testing
```bash
npm run lint         # Run ESLint
npm test             # Run Vitest tests
npm test -- --ui     # Run tests with UI
npm test -- --watch  # Run tests in watch mode
npm test -- path/to/test.test.tsx  # Run single test file
```

### Database
```bash
npm run db:reset     # Reset database (force)
npx prisma studio    # Open Prisma Studio (database GUI)
```

## Architecture Overview

### Virtual File System (Core Feature)

The application uses a **virtual file system** (`src/lib/file-system.ts`) that exists only in memory - no files are written to disk. This is fundamental to how the app works:

- **VirtualFileSystem class**: Manages an in-memory tree structure of files and directories
- **Serialization**: File tree is serialized to JSON and stored in Prisma database (`Project.data` field)
- **AI Tools**: AI uses `file_manager` and `str_replace_editor` tools (in `src/lib/tools/`) to manipulate the virtual file system
- **Preview**: Modified files are sent to preview iframe which renders them in real-time

When modifying file system logic, remember that files exist only in memory and must be serialized for persistence.

### AI Integration Flow

1. **User sends message** → `src/app/api/chat/route.ts` (POST endpoint)
2. **System prompt injected** → `src/lib/prompts/generation.ts` contains instructions for AI
3. **VirtualFileSystem reconstructed** → Deserialized from `Project.data` JSON
4. **AI streaming** → Uses Vercel AI SDK's `streamText()` with Claude model
5. **Tool execution** → AI can call `file_manager` and `str_replace_editor` tools
6. **Response saved** → Messages and file system state saved to database via `onFinish` callback

### Authentication & Data Model

**Database Schema** (`prisma/schema.prisma`):
- **User**: Standard auth with email/password (bcrypt hashed)
- **Project**: Belongs to User (or null for anonymous), stores messages as JSON string and file system as JSON string

**Auth Implementation**:
- Middleware (`src/middleware.ts`): JWT-based session verification
- Server actions (`src/actions/`): Create/get projects with auth checks
- Anonymous users: Can use app, but projects aren't persisted across sessions

**Important**: Prisma client is generated to `src/generated/prisma` (custom output path), not default `node_modules`.

### App Structure

**Next.js App Router**:
- `/` → Landing page (`src/app/page.tsx`)
- `/[projectId]` → Main chat/preview interface (`src/app/[projectId]/page.tsx`)
- `/api/chat` → AI streaming endpoint (`src/app/api/chat/route.ts`)

**Component Organization**:
- `src/components/chat/` → Chat UI (MessageList, MessageInput, MarkdownRenderer)
- `src/components/preview/` → Live preview frame
- `src/components/editor/` → Code editor and file tree
- `src/components/auth/` → Sign in/up forms
- `src/components/ui/` → Radix UI primitives

**State Management**:
- React Context (`src/lib/contexts/`) manages files, project ID, preview state
- Server state persisted via server actions + Prisma

### Node Compatibility

The project uses a custom Node.js compatibility shim (`node-compat.cjs`) loaded via `NODE_OPTIONS` in all npm scripts. This is required for the development and build process.

## Testing

Tests use **Vitest** with **React Testing Library**. Test files are colocated with components in `__tests__/` directories.

**Running specific tests**:
```bash
npm test -- src/components/chat/__tests__/MessageList.test.tsx
```

**Test environment**: jsdom (configured in `vitest.config.mts`)

## Code Style

- **Indentation**: 2 spaces
- **TypeScript**: Strict mode enabled, use type inference where possible
- **Imports**: Use `@/` path alias for `src/` directory
- **Server/Client**: Mark server-only code with `import "server-only"` directive

## Important Notes

- **API Key**: App works without `ANTHROPIC_API_KEY` (falls back to mock provider with static responses)
- **File System**: Never assume files exist on disk - all file operations go through VirtualFileSystem
- **Prisma**: Client is in `src/generated/prisma`, not `node_modules/@prisma/client`
- **AI Tools**: When modifying AI behavior, check both the system prompt (`src/lib/prompts/generation.ts`) and tool implementations (`src/lib/tools/`)
