# ChatGPT Clone - Full-Stack AI Chat Application | Next.js 14, AISDK, mem0, OpenAI

> **A production-ready MVP ChatGPT clone with advanced features like multimodal AI, persistent memory, file attachments, and real-time streaming responses.**

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen) ![Vercel](https://img.shields.io/badge/Vercel-AI%20SDK-orange)

## 📖 Table of Contents
- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔌 API Documentation](#-api-documentation)
- [🎨 Components](#-components)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

**ChatGPT Clone** is a sophisticated, full-stack AI chat application that replicates and extends OpenAI's ChatGPT interface. Built with **Next.js 14**, **TypeScript**, and **OpenAI GPT-4**, this project demonstrates modern web development practices and enterprise-grade architecture patterns.

Perfect for developers looking to understand:
- **Real-time AI streaming** with Vercel AI SDK
- **Full-stack TypeScript** development
- **Multimodal AI** integration (text, images, PDFs)
- **Persistent chat memory** with MongoDB
- **Production-ready authentication** with Clerk
- **Enterprise architecture** patterns

### 🎪 Live Demo
[🔗 **Try the Live Application**](https://your-demo-link.vercel.app) | [📚 **Documentation**](https://your-docs-link.com)

## ✨ Key Features

### 🤖 Advanced AI Capabilities
- **Real-Time Streaming Responses** - Token-by-token AI responses using Vercel AI SDK
- **Multimodal AI Support** - Text, image, PDF, and document processing
- **Long-Term Memory** - Persistent conversation context with mem0.ai
- **Message Editing & Regeneration** - Edit any message and regenerate responses
- **Context-Aware Conversations** - Maintains conversation history across sessions

### 💼 Enterprise Features
- **Production-Ready Authentication** - Secure user management with Clerk
- **Scalable Database Architecture** - MongoDB with optimized queries and indexing
- **File Upload & Processing** - PDF, DOCX, images with text extraction
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **TypeScript Throughout** - Full type safety across frontend and backend

### 🔧 Developer Experience
- **Modern Stack** - Next.js 14 App Router, React Server Components
- **API Routes** - RESTful endpoints with streaming support
- **Custom Hooks** - Reusable logic for chat, attachments, and state management
- **Component Library** - Modular, accessible components with Radix UI
- **Error Handling** - Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

### Frontend & Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### Backend & AI
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI model integration and streaming
- **[OpenAI GPT-4](https://openai.com/)** - Advanced language model
- **[mem0.ai](https://mem0.ai/)** - Long-term memory management
- **[Node.js](https://nodejs.org/)** - JavaScript runtime

### Database & Storage
- **[MongoDB](https://www.mongodb.com/)** - Document database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[Uploadcare](https://uploadcare.com/)** - File storage and CDN

### Authentication & Security
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Svix](https://www.svix.com/)** - Webhook handling

### File Processing
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** - PDF text extraction
- **[mammoth](https://www.npmjs.com/package/mammoth)** - DOCX processing

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or cloud)
- **API Keys**: OpenAI, Clerk, Uploadcare, mem0.ai

### 1-Minute Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/chatgpt-clone.git
cd chatgpt-clone

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your API keys in .env.local
# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with your API keys:

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone

# AI Services
OPENAI_API_KEY=sk-...
MEM0_API_KEY=m0-...

# File Upload
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
UPLOADCARE_SECRET_KEY=demosecretkey

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**🔗 Quick Links:**
- [Get OpenAI API Key](https://platform.openai.com/api-keys)
- [Setup Clerk Authentication](https://clerk.com/)
- [Configure MongoDB](https://www.mongodb.com/docs/guides/crud/install/)
- [Get mem0.ai API Key](https://mem0.ai/)

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes (serverless functions)
│   │   ├── chat/                 # Main chat endpoint with streaming
│   │   ├── upload/               # File upload processing
│   │   ├── memory/               # mem0.ai integration
│   │   └── webhooks/             # External service webhooks
│   ├── chat/                     # Chat interface pages
│   └── layout.tsx                # Root layout with providers
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── messages/                 # Message-specific components
│   └── chat-*.tsx                # Chat interface components
├── hooks/                        # Custom React hooks
│   ├── use-chat-with-attachments.ts  # Main chat logic
│   └── use-chat-data.ts          # Data fetching
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # Database connection
│   └── utils.ts                  # General utilities
├── models/                       # Database models
│   └── Chat.ts                   # Chat schema
└── types/                        # TypeScript definitions
```

## 🔌 API Documentation

### Core Endpoints

#### `POST /api/chat`
**Real-time streaming chat endpoint**

```typescript
// Request
{
  messages: CoreMessage[];
  chatId?: string;
  experimental_attachments?: FileAttachment[];
}

// Response: Streaming with X-Chat-Id header
```

#### `POST /api/upload`
**File upload with text extraction**

```typescript
// Request: FormData with file
// Response
{
  url: string;
  name: string;
  type: string;
  textContent?: string;
}
```

#### `GET/POST/DELETE /api/memory`
**Long-term memory management**

## 🎨 Core Components

### `useChatWithAttachments` Hook
**Main chat logic with file support**

```typescript
const {
  messages,
  input,
  attachments,
  isLoading,
  handleSubmit,
  handleFileUpload,
  handleEditMessage,
} = useChatWithAttachments({ chatId });
```

### `ChatLayout` Component
**Complete chat interface orchestration**

```typescript
<ChatLayout
  messages={messages}
  input={input}
  isLoading={isLoading}
  onSubmit={handleSubmit}
  attachments={attachments}
  onFileUpload={handleFileUpload}
/>
```

## 🤝 Contributing

We welcome contributions! This project is perfect for learning:

- **Modern React patterns** with Next.js 14
- **AI integration** with streaming responses  
- **Full-stack TypeScript** development
- **Database design** and optimization
- **Authentication** and security

### Getting Started
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Submit a pull request**

**🎯 Good First Issues:**
- Add new file type support (CSV, JSON)
- Improve error handling and user feedback
- Add keyboard shortcuts for better UX
- Implement message search functionality
- Add export chat functionality

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ⭐ Show Your Support

If this project helped you learn or build something awesome, please give it a ⭐! It helps others discover this educational resource.

**🔗 Connect & Share:**
- **Star this repo** if you found it useful
- **Follow me** for more AI and full-stack projects  
- **Share with developers** who want to learn AI integration
- **Contribute** to make this project even better

---
