import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { streamText, CoreMessage } from "ai";
import { createMem0, retrieveMemories } from "@mem0/vercel-ai-provider";
import { openai } from "@ai-sdk/openai";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";

// Allow streaming up to 30s
export const maxDuration = 30;

interface ContentItem {
  type: string;
  text?: string;
  image?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string | ContentItem[];
  timestamp: Date;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  await dbConnect();

  try {
    const { chatId, messageIndex, newContent } = await req.json();

    if (!chatId || messageIndex === undefined || !newContent) {
      return NextResponse.json(
        { error: "ChatId, messageIndex, and newContent are required" },
        { status: 400 }
      );
    }

    // Find the chat
    const chat = await Chat.findOne({ chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Validate message index
    if (messageIndex < 0 || messageIndex >= chat.messages.length) {
      return NextResponse.json({ error: "Invalid message index" }, { status: 400 });
    }

    // Ensure the message being edited is a user message
    if (chat.messages[messageIndex].role !== "user") {
      return NextResponse.json(
        { error: "Can only edit user messages" },
        { status: 400 }
      );
    }

    // Update the message content
    chat.messages[messageIndex].content = newContent;
    chat.messages[messageIndex].timestamp = new Date();

    // Remove all messages after the edited message
    chat.messages = chat.messages.slice(0, messageIndex + 1);

    await chat.save();

    // Now generate a new response from the AI
    const mem0 = createMem0({
      provider: "openai",
      mem0ApiKey: process.env.MEM0_API_KEY!,
      apiKey: process.env.OPENAI_API_KEY!,
      mem0Config: {
        user_id: userId,
        org_id: process.env.MEM0_ORG_ID,
        project_id: process.env.MEM0_PROJECT_ID,
      },
    });

    // Get system prompt with memory context
    let systemPrompt = "You are a helpful assistant.";
    try {
      const memoryContext = await retrieveMemories(
        [
          {
            role: "user",
            content: [{ type: "text", text: "__FETCH__" }],
          },
        ],
        { user_id: userId, mem0ApiKey: process.env.MEM0_API_KEY! }
      );

      if (memoryContext && memoryContext.trim()) {
        systemPrompt = memoryContext;
      }
    } catch (error) {
      console.error("Error retrieving memories:", error);
    }

    // Convert messages to CoreMessage format
    const coreMessages: CoreMessage[] = chat.messages.map((message: Message) => {
      // Handle multi-modal content
      if (message.role === "user" && Array.isArray(message.content)) {
        const content: ContentItem[] = [];
        
        message.content.forEach((item) => {
          if (typeof item === "string") {
            content.push({ type: "text", text: item });
          } else if (item.type === "text" && item.text) {
            content.push({ type: "text", text: item.text });
          } else if (item.type === "image" && item.image) {
            content.push({ type: "image", image: item.image });
          }
        });

        // Add attachments if present
        if (message.attachments && message.attachments.length > 0) {
          for (const attachment of message.attachments) {
            if (attachment.type === "image") {
              content.push({
                type: "image",
                image: attachment.url,
              });
            } else if (attachment.type === "pdf") {
              // For PDFs, we should have extracted text content
              content.push({
                type: "text",
                text: `PDF Content from ${attachment.name}`,
              });
            }
          }
        }

        return {
          role: message.role,
          content: content.length > 0 ? content : message.content,
        } as CoreMessage;
      }

      return {
        role: message.role,
        content: message.content,
      } as CoreMessage;
    });

    // Generate AI response
    const aiStream = streamText({
      model: mem0("gpt-4o", { user_id: userId }),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: async (completion) => {
        chat.messages.push({
          role: "assistant",
          content: completion.text,
          timestamp: new Date(),
        });
        await chat.save();
      },
    });

    const response = aiStream.toDataStreamResponse();
    response.headers.set("X-Chat-Id", chatId);
    return response;
  } catch (error) {
    console.error("Error editing message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
