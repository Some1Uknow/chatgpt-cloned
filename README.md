# ChatGPT Clone - Full-Stack AI Chat Application

## 🚀 Overview

A modern, feature-rich ChatGPT clone built with Next.js 15, featuring real-time AI conversations, persistent memory, file attachments, and a beautiful responsive UI. This application provides a complete ChatGPT-like experience with user authentication, chat history, memory management, and file upload capabilities.

## ✨ Features

### 🤖 Core AI Features
- **OpenAI GPT Integration**: Real-time streaming responses using OpenAI's latest GPT models
- **Persistent Memory**: AI remembers context across conversations using Mem0 AI
- **Memory Management**: View, add, and delete AI memories through dedicated interface
- **Context-Aware Conversations**: Maintains conversation history and context

### 💬 Chat Features
- **Real-time Streaming**: Live message streaming with typing indicators
- **Chat History**: Persistent chat sessions with automatic saving
- **Multiple Conversations**: Create and manage multiple chat sessions
- **Export Conversations**: Save chat history

### 📎 File Handling
- **File Attachments**: Upload and attach files to messages
- **PDF Processing**: Extract and process text from PDF files
- **Image Support**: Upload and analyze images
- **Multiple File Types**: Support for various file formats
- **File Preview**: Display file attachments with metadata

### 🔐 Authentication & Security
- **Clerk Authentication**: Secure user authentication and session management
- **Protected Routes**: Middleware-based route protection
- **User Management**: Profile management and user sessions
- **Webhook Integration**: Real-time user synchronization

### 🎨 User Interface
- **Modern Design**: Clean, ChatGPT-inspired interface
- **Responsive Layout**: Mobile-first responsive design
- **Dark Theme**: Dark mode optimized interface
- **Animated Elements**: Smooth animations and transitions
- **Sidebar Navigation**: Collapsible sidebar with chat history
- **Loading States**: Skeleton loaders and progress indicators

### 🗄️ Data Management
- **MongoDB Integration**: Persistent data storage
- **Real-time Updates**: Live chat synchronization
- **Data Validation**: Robust input validation and error handling
- **Efficient Queries**: Optimized database operations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Accessible component primitives
- **TanStack Query** - Data fetching and caching

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **OpenAI API** - GPT model integration
- **Mem0 AI** - Persistent memory management
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **Uploadcare** - File upload and management

### Authentication & Security
- **Clerk** - User authentication and management
- **Svix** - Webhook handling
- **JWT** - Secure token management

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast development builds

## 📋 Prerequisites

Before installation, ensure you have:

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud)
- **OpenAI API** account and key
- **Clerk** account for authentication
- **Mem0 AI** account and API key
- **Uploadcare** account for file uploads

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatgpt-clone
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatgpt-clone

# Mem0 AI Configuration
MEM0_API_KEY=your_mem0_api_key
MEM0_ORG_ID=your_mem0_org_id
MEM0_PROJECT_ID=your_mem0_project_id

# Uploadcare Configuration
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Ensure MongoDB is running:

```bash
# For local MongoDB
mongod

# For MongoDB Atlas, ensure your connection string is correct in .env.local
```

### 5. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up options
3. Set up webhooks endpoint: `your-domain/api/webhooks/clerk`
4. Add your keys to `.env.local`

### 6. OpenAI Setup

1. Create an account at [OpenAI](https://platform.openai.com)
2. Generate an API key
3. Add billing information for API usage
4. Add the key to `.env.local`

### 7. Mem0 AI Setup

1. Create an account at [Mem0](https://mem0.ai)
2. Create a project and organization
3. Generate API keys
4. Add credentials to `.env.local`

### 8. Uploadcare Setup

1. Create an account at [Uploadcare](https://uploadcare.com)
2. Get your public key
3. Add to `.env.local`

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Development with Turbopack

```bash
npm run dev
# Already configured with --turbopack flag
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat management
│   │   │   ├── route.ts          # Main chat API
│   │   │   ├── delete/           # Delete messages
│   │   │   └── edit/             # Edit messages
│   │   ├── chat-list/            # Chat history API
│   │   ├── memory/               # Memory management
│   │   ├── upload/               # File upload handling
│   │   └── webhooks/             # Webhook endpoints
│   ├── chat/                     # Chat interface
│   │   ├── layout.tsx            # Chat layout
│   │   └── [[...id]]/            # Dynamic chat routes
│   ├── sign-in/                  # Authentication pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React Components
│   ├── ui/                       # UI primitives
│   ├── animated-gradient.tsx     # Gradient animations
│   ├── chat-header.tsx           # Chat header component
│   ├── chat-input.tsx            # Message input
│   ├── chat-layout.tsx           # Main chat layout
│   ├── chat-messages.tsx         # Message display
│   ├── chat-sidebar.tsx          # Navigation sidebar
│   ├── error-state.tsx           # Error handling
│   ├── file-attachment-display.tsx # File previews
│   ├── file-upload-dropdown.tsx  # File upload UI
│   ├── loading-state.tsx         # Loading indicators
│   ├── memory-modal.tsx          # Memory management
│   └── welcome-message.tsx       # Initial greeting
├── hooks/                        # Custom React Hooks
│   ├── use-auth-redirect.ts      # Authentication handling
│   ├── use-chat-data.ts          # Chat data management
│   ├── use-chat-transition.ts    # Chat navigation
│   ├── use-chat-with-attachments.ts # Chat with files
│   └── use-mobile.ts             # Mobile detection
├── lib/                          # Utility Libraries
│   ├── mongodb.ts                # Database connection
│   ├── user.ts                   # User utilities
│   └── utils.ts                  # General utilities
├── models/                       # Database Models
│   ├── Chat.ts                   # Chat schema
│   └── User.ts                   # User schema
└── types/                        # TypeScript Types
    └── chat.ts                   # Chat-related types
```

## 🔧 API Endpoints

### Chat Management
- **POST** `/api/chat` - Send messages and get AI responses
- **GET** `/api/chat?id={chatId}` - Retrieve chat history
- **DELETE** `/api/chat/delete` - Delete messages
- **PUT** `/api/chat/edit` - Edit messages

### Chat List
- **GET** `/api/chat-list` - Get user's chat history

### Memory Management
- **GET** `/api/memory` - Retrieve AI memories
- **POST** `/api/memory` - Add new memories
- **DELETE** `/api/memory` - Delete memories

### File Upload
- **POST** `/api/upload` - Upload files and attachments

### Webhooks
- **POST** `/api/webhooks/clerk` - Handle Clerk user events

## 🔗 Key Integrations

### OpenAI Integration
The application uses the OpenAI API with streaming responses:

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await streamText({
  model: openai("gpt-4"),
  messages: conversationMessages,
  maxTokens: 1000,
});
```

### Mem0 AI Memory
Persistent memory across conversations:

```typescript
import { createMem0, retrieveMemories } from "@mem0/vercel-ai-provider";

const mem0 = createMem0({
  provider: "openai",
  mem0ApiKey: process.env.MEM0_API_KEY,
  mem0Config: {
    user_id: userId,
    org_id: process.env.MEM0_ORG_ID,
    project_id: process.env.MEM0_PROJECT_ID,
  },
});
```

### MongoDB with Mongoose
Data persistence with structured schemas:

```typescript
const ChatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Clerk Authentication
Secure user management:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/chat(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  // Route protection logic
});
```

## 🎯 Usage Guide

### Starting a New Chat
1. Navigate to the application
2. Sign in or create an account
3. Click "New Chat" or start typing in the input field
4. Send your first message to begin conversation

### Managing Files
1. Click the attachment icon in the chat input
2. Select files from your device
3. Files are automatically uploaded and processed
4. PDF text is extracted and included in the conversation

### Memory Management
1. Click the memory icon in the sidebar
2. View current AI memories
3. Add new memories manually
4. Delete unwanted memories
5. Memories persist across all conversations

### Chat History
1. All conversations are automatically saved
2. Access previous chats from the sidebar
3. Edit or delete individual messages
4. Export conversation history

## 🐛 Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
- Ensure `.env.local` is in the root directory
- Restart the development server
- Check for typos in variable names

**2. Database Connection Issues**
- Verify MongoDB is running
- Check connection string format
- Ensure network access for MongoDB Atlas

**3. Authentication Problems**
- Verify Clerk configuration
- Check webhook endpoints
- Ensure correct redirect URLs

**4. OpenAI API Errors**
- Verify API key validity
- Check account billing status
- Monitor rate limits

**5. File Upload Issues**
- Verify Uploadcare configuration
- Check file size limits
- Ensure proper CORS settings

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Ensure all environment variables are configured in your deployment platform:
- All API keys and secrets
- Production database URLs
- Correct webhook endpoints
- Production domain URLs

### Database Migration
For production deployment:
1. Set up MongoDB Atlas or production MongoDB
2. Update connection strings
3. Ensure proper indexing for performance

## 📈 Performance Optimization

### Implemented Optimizations
- **Server-side Rendering**: Next.js SSR for faster initial loads
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: React Query for client-side caching
- **Streaming**: Real-time message streaming

### Monitoring
- Monitor API response times
- Track database query performance
- Monitor memory usage
- Set up error tracking (Sentry recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Maintain code documentation
- Follow established code style
- Update README for new features

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT API
- **Vercel** for Next.js framework
- **Clerk** for authentication
- **Mem0 AI** for memory management
- **MongoDB** for database
- **Uploadcare** for file handling
- **Radix UI** for accessible components

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**