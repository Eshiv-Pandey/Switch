import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── AI Accounts ──────────────────────────────────────────────────────────────
export const aiAccounts = pgTable("ai_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", {
    enum: ["claude", "chatgpt", "gemini", "deepseek", "openrouter"],
  }).notNull(),
  accountLabel: text("account_label").notNull(),
  apiKey: text("api_key").notNull(),
  modelId: text("model_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").notNull().default("📁"),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  activeAccountId: text("active_account_id"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  modelProvider: text("model_provider"), // "claude" | "chatgpt" | "gemini" | "deepseek" | "openrouter"
  accountId: text("account_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Memory Entries ───────────────────────────────────────────────────────────
export const memoryEntries = pgTable("memory_entries", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", {
    enum: ["summary", "decision", "todo", "goal", "preference", "file"],
  }).notNull(),
  content: text("content").notNull(),
  sourceMessageId: text("source_message_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Uploaded Files ───────────────────────────────────────────────────────────
export const uploadedFiles = pgTable("uploaded_files", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Context Transfers ────────────────────────────────────────────────────────
export const contextTransfers = pgTable("context_transfers", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  fromAccountId: text("from_account_id"),
  toAccountId: text("to_account_id"),
  fromProvider: text("from_provider"),
  toProvider: text("to_provider"),
  contextPackage: jsonb("context_package"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AiAccount = typeof aiAccounts.$inferSelect;
export type NewAiAccount = typeof aiAccounts.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type NewMemoryEntry = typeof memoryEntries.$inferInsert;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;
export type ContextTransfer = typeof contextTransfers.$inferSelect;
