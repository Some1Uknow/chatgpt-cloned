# ChatGPT Clone - Full-Stack AI Chat Application

A sophisticated, production-ready ChatGPT clone built with Next.js 14, featuring real-time streaming, multimodal capabilities, persistent chat history, and advanced memory management. This application demonstrates enterprise-grade architecture patterns and modern full-stack development practices.

## 🚀 Project Overview

This ChatGPT clone is a comprehensive AI chat platform that replicates and extends the functionality of OpenAI's ChatGPT interface. The application serves as a reference implementation for building scalable, feature-rich AI chat applications with modern web technologies.

### Core Value Proposition

- **Enterprise-Ready Architecture**: Built with Next.js 14 App Router, TypeScript, and serverless functions
- **Real-Time Streaming**: Implements streaming responses using Vercel AI SDK for optimal user experience
- **Multimodal AI Interactions**: Supports text, images, PDFs, and document processing
- **Persistent Memory**: Integrates with mem0.ai for cross-session conversational context
- **Production-Grade Authentication**: Clerk integration with secure API route protection
- **Scalable Data Architecture**: MongoDB with Mongoose ODM for reliable data persistence

## 🛠️ Core Features

### Real-Time Chat Interface

The application utilizes the **Vercel AI SDK** (`ai` package) to implement streaming chat responses:

```typescript
// Real-time streaming implementation
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
  onResponse(response) {
    // Handle streaming response headers
    const newChatId = response.headers.get("X-Chat-Id");
  },
  onFinish(message) {
    // Refresh sidebar on completion
    refreshChatSidebar();
  }
});
```

**Technical Implementation:**
- Uses `streamText` from AI SDK for token-by-token response streaming
- Implements optimistic UI updates with `@ai-sdk/react` hooks
- Manages WebSocket-like connections through Server-Sent Events (SSE)
- Handles connection recovery and error states gracefully

### User Authentication & Authorization

**Clerk Integration** provides comprehensive authentication:

```typescript
// API route protection
const { userId } = getAuth(req);
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Key Features:**
- OAuth providers (Google, GitHub, etc.)
- Session management with automatic token refresh
- Middleware-based route protection
- User profile management
- Webhook integration for user lifecycle events

### File Attachments & Multimodality

End-to-end file processing pipeline:

**1. Client-Side Upload (`FileUploadDropdown`)**
```typescript
const handleFileUpload = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
};
```

**2. Server-Side Processing (`/api/upload`)**
- **Uploadcare Integration**: Handles file storage and CDN distribution
- **Text Extraction**:
  - PDFs: `pdf-parse` library for text extraction
  - DOCX: `mammoth` library for Word document processing
  - Images: Base64 encoding for multimodal AI processing
  - CSV/TXT: Direct text parsing

**3. AI Model Integration**
```typescript
// Multimodal content formatting
const content: ContentItem[] = [
  { type: "text", text: userMessage },
  { type: "image", image: attachmentUrl }
];
```

### Persistent Chat History

**MongoDB Schema Design:**
```typescript
// Chat document structure
const ChatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'New Chat' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    attachments: [AttachmentSchema]
  }]
});
```

**Data Flow:**
1. Messages stored in MongoDB with rich metadata
2. Efficient querying with indexed fields (`chatId`, `userId`)
3. Optimized for read-heavy workloads with message pagination
4. Automatic timestamps and schema validation

### Long-Term Memory Integration

**mem0.ai Integration** for conversational context:

```typescript
// Memory retrieval and storage
const mem0 = createMem0({
  provider: "openai",
  mem0ApiKey: process.env.MEM0_API_KEY!,
  apiKey: process.env.OPENAI_API_KEY!,
});

// Retrieve user memories
const memories = await retrieveMemories(mem0, {
  user_id: userId,
  limit: 10,
});
```

**Implementation Details:**
- Stores user preferences, conversation patterns, and context
- Retrieves relevant memories based on conversation topics
- Automatically updates memory based on new interactions
- Provides personalized responses across chat sessions

### Message Editing & Conversation Branching

**Complex State Management:**
```typescript
const handleEditMessage = async (messageIndex: number, newContent: string) => {
  // 1. Find the message to edit
  const messageToEdit = messages[messageIndex];
  
  // 2. Truncate conversation from edit point
  const truncatedMessages = messages.slice(0, messageIndex + 1);
  
  // 3. Update the message content
  truncatedMessages[messageIndex].content = newContent;
  
  // 4. Regenerate AI response from edit point
  const response = await fetch("/api/chat/edit-message", {
    method: "POST",
    body: JSON.stringify({ chatId, messageIndex, newContent })
  });
};
```

**Technical Approach:**
- Database-level message truncation
- Optimistic UI updates during regeneration
- Maintains conversation coherence
- Handles concurrent edit scenarios

### Optimistic UI Updates

**Implementation Examples:**

**Memory Deletion:**
```typescript
// Immediate UI update
const optimisticDelete = (memoryId: string) => {
  // Update UI immediately
  setMemories(prev => prev.filter(m => m.id !== memoryId));
  
  // Perform API call in background
  fetch(`/api/memory/${memoryId}`, { method: "DELETE" })
    .catch(() => {
      // Rollback on failure
      setMemories(prev => [...prev, deletedMemory]);
    });
};
```

**Message Sending:**
- Adds user message to UI immediately
- Shows loading indicator for AI response
- Handles network failures with retry logic

## 🏗️ Technical Architecture & Data Flow

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 14    │    │   Vercel AI     │    │   OpenAI API    │
│   App Router    │◄──►│     SDK         │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Uploadcare    │    │   mem0.ai       │
│   Database      │    │   File Storage  │    │   Memory        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Detailed User Interaction Flow

**Scenario: User uploads PDF and asks a question**

1. **Authentication**
   ```typescript
   // Clerk middleware validates session
   const { userId } = auth();
   ```

2. **File Upload**
   ```typescript
   // Client initiates upload
   useChatWithAttachments.handleFileUpload(file, "pdf");
   
   // Server processes via /api/upload
   const buffer = await file.arrayBuffer();
   const pdfData = await pdfParse(Buffer.from(buffer));
   const textContent = pdfData.text;
   ```

3. **State Management**
   ```typescript
   // useChatWithAttachments manages attachment state
   const [attachments, setAttachments] = useState<FileAttachment[]>([]);
   
   // Updates UI optimistically
   setAttachments(prev => [...prev, newAttachment]);
   ```

4. **Message Submission**
   ```typescript
   // Enhanced message with attachments
   const enhancedMessage = {
     content: userInput,
     experimental_attachments: attachments.map(att => ({
       url: att.url,
       contentType: getContentTypeForAttachment(att.type)
     }))
   };
   ```

5. **Backend Processing**
   ```typescript
   // /api/chat route handles the request
   
   // a. Retrieve user memories
   const memories = await retrieveMemories(mem0, { user_id: userId });
   
   // b. Format multimodal content
   const content = formatMultimodalContent(message, attachments);
   
   // c. Save to MongoDB
   await Chat.findOneAndUpdate(
     { chatId, userId },
     { $push: { messages: userMessage } }
   );
   
   // d. Stream AI response
   const result = await streamText({
     model: openai("gpt-4"),
     messages: [systemPrompt, ...memories, ...conversationHistory],
     experimental_attachments: attachments
   });
   ```

6. **Real-Time Response**
   ```typescript
   // Client receives streaming response
   return result.toDataStreamResponse({
     headers: { "X-Chat-Id": chatId }
   });
   ```

7. **Memory Update**
   ```typescript
   // Update long-term memory
   await mem0.add(userMessage, { user_id: userId });
   await mem0.add(aiResponse, { user_id: userId });
   ```

## 📚 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Tanstack Query**: Data fetching and caching
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless functions
- **Vercel AI SDK**: AI model integration
- **Node.js Runtime**: Server-side JavaScript execution

### Database
- **MongoDB**: Document-based database
- **Mongoose**: ODM for MongoDB

### AI Services
- **OpenAI API**: GPT-4 model integration
- **mem0.ai**: Long-term memory management
- **Vercel AI SDK**: Streaming and UI utilities

### Authentication
- **Clerk**: Authentication and user management
- **Svix**: Webhook handling

### File Processing
- **Uploadcare**: File storage and CDN
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX processing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes (serverless functions)
│   │   ├── chat/                 # Chat-related endpoints
│   │   │   ├── route.ts          # Main chat endpoint with streaming
│   │   │   ├── edit-message/     # Message editing functionality
│   │   │   └── delete/           # Chat deletion
│   │   ├── upload/               # File upload processing
│   │   ├── memory/               # mem0.ai integration
│   │   └── webhooks/             # External service webhooks
│   ├── chat/                     # Chat interface pages
│   │   ├── layout.tsx            # Chat-specific layout
│   │   └── [[...id]]/            # Dynamic chat routes
│   ├── sign-in/                  # Authentication pages
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout with providers
├── components/                   # React components
│   ├── ui/                       # Reusable UI components (Radix-based)
│   ├── messages/                 # Message-specific components
│   ├── chat-*.tsx                # Chat interface components
│   └── file-*.tsx                # File handling components
├── hooks/                        # Custom React hooks
│   ├── use-chat-with-attachments.ts  # Main chat logic
│   ├── use-chat-data.ts          # Data fetching
│   └── use-chat-transition.ts    # Navigation transitions
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # Database connection
│   ├── utils.ts                  # General utilities
│   └── fetch-utils.ts            # API utilities
├── models/                       # Database models
│   ├── Chat.ts                   # Chat schema
│   └── User.ts                   # User schema
├── types/                        # TypeScript definitions
│   └── chat.ts                   # Chat-related types
└── contexts/                     # React contexts
    └── chat-sidebar-context.tsx  # Sidebar state management
```

## 🔌 API Endpoints

### `/api/chat` - POST
**Purpose**: Main chat endpoint with streaming support
**Payload**:
```typescript
{
  messages: CoreMessage[];
  chatId?: string;
  experimental_attachments?: {
    url: string;
    contentType: string;
  }[];
}
```
**Response**: Streaming text response with `X-Chat-Id` header

### `/api/chat/edit-message` - POST
**Purpose**: Edit existing message and regenerate conversation
**Payload**:
```typescript
{
  chatId: string;
  messageIndex: number;
  newContent: string;
}
```
**Response**: Updated message array with regenerated responses

### `/api/upload` - POST
**Purpose**: Handle file uploads and text extraction
**Payload**: FormData with file and type
**Response**:
```typescript
{
  url: string;
  name: string;
  type: string;
  textContent?: string;
}
```

### `/api/memory` - GET/POST/DELETE
**Purpose**: Manage user memories via mem0.ai
**GET Response**: Array of user memories
**POST Payload**: Memory content and metadata
**DELETE**: Remove specific memory by ID

### `/api/chat-list` - GET
**Purpose**: Retrieve user's chat history
**Response**: Array of chat summaries with metadata

## 🧩 Core Components & Hooks

### Components

#### `ChatLayout.tsx`
**Responsibilities**:
- Orchestrates the entire chat interface
- Manages layout switching (centered vs. bottom input)
- Handles welcome message display
- Coordinates between header, messages, and input components

```typescript
interface ChatLayoutProps {
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showWelcome?: boolean;
  inputPosition?: "center" | "bottom";
  attachments?: FileAttachment[];
  onFileUpload?: (attachment: FileAttachment) => void;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
}
```

#### `ChatMessages.tsx`
**Responsibilities**:
- Renders message history with proper styling
- Handles message editing UI
- Manages scroll behavior and auto-scroll
- Implements message-specific features (copy, edit, delete)

#### `ChatInput.tsx`
**Responsibilities**:
- Handles user input with auto-resize
- Manages file attachment UI
- Implements keyboard shortcuts
- Provides send button with loading states

### Hooks

#### `useChatWithAttachments.ts`
**Core Logic**:
```typescript
export function useChatWithAttachments({ 
  chatId, 
  onAttachmentChange 
}: UseChatWithAttachmentsProps) {
  // File attachment management
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  
  // Chat state management
  const [isNewChat, setIsNewChat] = useState<boolean>(!chatId);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  
  // Enhanced useChat hook with attachment support
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onResponse: handleChatResponse,
    onFinish: handleChatFinish,
    onError: handleChatError,
  });
  
  // Message editing with conversation truncation
  const handleEditMessage = async (messageIndex: number, newContent: string) => {
    // Complex logic for message editing and regeneration
  };
  
  return {
    messages,
    input,
    attachments,
    isLoading,
    handleInputChange,
    handleSubmit: enhancedHandleSubmit,
    handleFileUpload,
    handleRemoveAttachment,
    handleEditMessage,
    currentChatId,
    isNewChat,
    error,
  };
}
```

#### `useChatData.ts`
**Responsibilities**:
- Fetches chat history from API
- Manages loading and error states
- Implements SWR for efficient data fetching
- Handles chat list updates

#### `useChatTransition.ts`
**Responsibilities**:
- Manages navigation between chats
- Handles URL updates and browser history
- Implements smooth transitions
- Maintains state consistency during navigation

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- MongoDB instance (local or cloud)
- Clerk account
- OpenAI API key
- Uploadcare account
- mem0.ai API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatgpt-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` with the following variables:
   ```bash
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
   # or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
   
   # AI Services
   OPENAI_API_KEY=sk-...
   MEM0_API_KEY=m0-...
   
   # File Upload
   NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
   UPLOADCARE_SECRET_KEY=demosecretkey
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running locally or configure cloud connection
   # The application will automatically create collections on first run
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for client-side auth | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth | ✅ |
| `CLERK_WEBHOOK_SECRET` | Webhook signature verification | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for GPT models | ✅ |
| `MEM0_API_KEY` | mem0.ai API key for memory management | ✅ |
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Uploadcare public key | ✅ |
| `UPLOADCARE_SECRET_KEY` | Uploadcare secret key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ✅ |

## 🚀 Potential Improvements & Roadmap

### Scalability Enhancements

#### Database Optimization
- **Implement MongoDB Sharding**: Distribute chat data across multiple shards based on `userId`
- **Add Redis Caching**: Cache frequently accessed chats and user sessions
- **Implement Database Indexing Strategy**:
  ```typescript
  // Compound indexes for efficient queries
  ChatSchema.index({ userId: 1, updatedAt: -1 });
  ChatSchema.index({ chatId: 1, userId: 1 });
  ```
- **Message Pagination**: Implement cursor-based pagination for large chat histories
- **Archive Strategy**: Move old chats to cold storage after inactivity

#### Performance Optimization
- **Implement CDN**: Use Vercel Edge Network for static assets
- **Add Response Compression**: Gzip/Brotli compression for API responses
- **Database Connection Pooling**: Optimize MongoDB connection management
- **Implement Caching Strategy**: Edge caching for user preferences and chat metadata

### Advanced Features

#### Agent-Based Workflows
```typescript
interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  systemPrompt: string;
  tools: Tool[];
}

// Multi-agent conversation orchestration
const orchestrateAgents = async (userQuery: string, agents: Agent[]) => {
  const relevantAgents = selectAgents(userQuery, agents);
  const responses = await Promise.all(
    relevantAgents.map(agent => agent.process(userQuery))
  );
  return synthesizeResponses(responses);
};
```

#### Function Calling Integration
```typescript
// OpenAI function calling for external API integration
const tools = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          num_results: { type: "number" }
        }
      }
    }
  }
];
```

#### Advanced RAG Pipeline
- **Vector Database Integration**: Implement Pinecone/Weaviate for semantic search
- **Document Chunking Strategy**: Smart text splitting for large documents
- **Hybrid Search**: Combine keyword and semantic search
- **Context Window Management**: Intelligent context selection for long conversations

### Testing Strategy

#### Unit Testing
```typescript
// Component testing with React Testing Library
describe('ChatInput', () => {
  it('should handle file upload correctly', async () => {
    const mockOnFileUpload = jest.fn();
    render(<ChatInput onFileUpload={mockOnFileUpload} />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    await userEvent.upload(fileInput, file);
    expect(mockOnFileUpload).toHaveBeenCalledWith(expect.objectContaining({
      name: 'test.pdf',
      type: 'pdf'
    }));
  });
});
```

#### Integration Testing
```typescript
// API route testing
describe('/api/chat', () => {
  it('should stream chat response with authentication', async () => {
    const mockAuth = { userId: 'test-user' };
    jest.mocked(getAuth).mockReturnValue(mockAuth);
    
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
    );
    
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Chat-Id')).toBeDefined();
  });
});
```

#### End-to-End Testing
```typescript
// Playwright E2E tests
test('complete chat flow with file upload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Upload file
  await page.setInputFiles('[data-testid="file-upload"]', 'test-document.pdf');
  
  // Send message
  await page.fill('[data-testid="chat-input"]', 'Summarize this document');
  await page.click('[data-testid="send-button"]');
  
  // Verify response
  await expect(page.getByText(/summary/i)).toBeVisible();
});
```

### Architecture Improvements

#### Microservices Transition
- **Service Decomposition**: Split into chat, auth, file-processing, and memory services
- **API Gateway**: Implement centralized routing and rate limiting
- **Message Queue**: Add Redis/RabbitMQ for async processing
- **Service Mesh**: Implement Istio for service-to-service communication

#### Monitoring & Observability
- **Application Monitoring**: Integrate Sentry for error tracking
- **Performance Monitoring**: Add New Relic or DataDog
- **Custom Metrics**: Track chat completion rates, response times
- **Logging Strategy**: Structured logging with correlation IDs
