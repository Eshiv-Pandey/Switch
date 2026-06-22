# Switch — AI Model Switcher

<div align="center">
  <img src="./public/switch-logo.png" alt="Switch Logo" width="200" />
</div>

> **Switch** is a universal AI workspace that lets you move seamlessly between Claude, ChatGPT, Gemini, DeepSeek, and various OpenRouter models **without losing context**.
> 
> When you switch models mid-conversation, Switch automatically packages your chat history, files, and project memories, and injects them into the new model's context window. One workspace. Multiple AI brains.

## Quick Start

### 1. Install dependencies (already done)
```bash
npm install
```

### 2. Set up environment variables

Edit `.env.local`:
```env
DATABASE_URL=file:./switch.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

### 3. Push the database schema
```bash
npm run db:push
```

### 4. Run the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` as an Authorized redirect URI
6. Copy Client ID and Client Secret to `.env.local`

---

## Adding AI Accounts

Once signed in:
1. Go to **Settings** in the sidebar
2. Click **Add Account**
3. Select your AI provider (Claude, ChatGPT, Gemini, DeepSeek)
4. Enter a label (e.g., "Account 1") and paste your API key
5. Your key is stored locally in `switch.db`

### Where to get API keys:
- **Claude**: https://console.anthropic.com/
- **ChatGPT**: https://platform.openai.com/api-keys
- **Gemini**: https://aistudio.google.com/apikey
- **DeepSeek**: https://platform.deepseek.com/api_keys

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected app routes
│   │   ├── dashboard/        # Stats overview
│   │   ├── chat/[projectId]/ # Chat interface
│   │   ├── projects/         # Project management
│   │   ├── memory/           # Memory entries
│   │   ├── files/            # File uploads
│   │   └── settings/         # AI account management
│   ├── api/
│   │   ├── auth/             # NextAuth handler
│   │   ├── chat/             # Unified AI gateway (streaming)
│   │   ├── switch/           # Context transfer engine
│   │   ├── projects/         # Project CRUD
│   │   ├── accounts/         # AI account management
│   │   └── memory/           # Memory entry CRUD
│   ├── sign-in/              # Google OAuth page
│   └── page.tsx              # Landing page
├── lib/
│   ├── ai/
│   │   ├── providers.ts      # Claude/ChatGPT/Gemini/DeepSeek gateway
│   │   └── context-transfer.ts # Context package builder
│   ├── db/
│   │   ├── schema.ts         # Drizzle ORM schema
│   │   └── index.ts          # DB connection
│   └── auth.ts               # NextAuth config
└── components/
    └── app/
        ├── AppSidebar.tsx    # Model/account switcher sidebar
        ├── ChatInterface.tsx # Streaming chat + switch modal
        └── NewProjectModal.tsx
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom glassmorphism |
| Auth | NextAuth v5 (Google OAuth) |
| Database | SQLite via @libsql/client + Drizzle ORM |
| AI Providers | Claude, ChatGPT, Gemini, DeepSeek (streaming SSE) |
| Animations | Framer Motion |

---

## How Context Transfer Works

1. User clicks **Switch** in the chat header
2. A modal shows all available AI models/accounts
3. User selects the new model
4. `/api/switch` is called which:
   - Loads recent messages + memory entries + files
   - Builds a structured `ContextPackage`
   - Converts it to a system prompt
   - Injects it as the first message in the session
   - Records the transfer in `context_transfers` table
5. The new model responds with full awareness of the previous session
