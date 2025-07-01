// api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { streamText, generateText, CoreMessage } from "ai";
import { createMem0, retrieveMemories } from "@mem0/vercel-ai-provider";
import { openai } from "@ai-sdk/openai";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { v4 as uuidv4 } from "uuid";

// Allow streaming up to 30s
export const maxDuration = 30;

interface Attachment {
  url: string;
  name: string;
  type: string;
  textContent?: string;
}

interface ContentItem {
  type: string;
  text?: string;
  image?: string;
}

interface ExperimentalAttachment {
  contentType?: string;
  url: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string | ContentItem[];
  timestamp: Date;
  attachments?: Attachment[];
  experimental_attachments?: ExperimentalAttachment[];
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

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

  const url = new URL(req.url);
  let chatId = url.searchParams.get("id");
  const body = await req.json();
  const { messages, attachments } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  let chat = await Chat.findOne({ chatId, userId });
  let isFirstMessage = false;

  const lastMessage = messages[messages.length - 1];
  const messageAttachments = attachments || [];

  const createNewMessage = (
    message: Message,
    attachments: Attachment[] = []
  ) => {
    const newMessage: {
      role: string;
      content: string | ContentItem[];
      timestamp: Date;
      attachments?: Array<{
        url: string;
        name: string;
        type: string;
      }>;
    } = {
      role: message.role,
      content: message.content, // Keep original content structure
      timestamp: new Date(),
    };

    if (attachments.length > 0) {
      newMessage.attachments = attachments.map((att) => ({
        url: att.url,
        name: att.name,
        type: att.type,
      }));
    }
    return newMessage;
  };

  if (chat) {
    // Add new message with all its attachments
    const newMessage = createNewMessage(lastMessage, messageAttachments);
    chat.messages.push(newMessage);
  } else {
    chatId = uuidv4();
    isFirstMessage = true;
    chat = new Chat({
      chatId,
      userId,
      messages: messages.map((m: Message, index: number) => {
        const isLastMessage = index === messages.length - 1;
        // Attachments are only for the last user message
        const attachmentsForMessage =
          isLastMessage && m.role === "user" ? messageAttachments : [];
        return createNewMessage(m, attachmentsForMessage);
      }),
    });
  }

  try {
    await chat.save();
  } catch (error) {
    console.error("Error saving chat:", error);
    throw error;
  }

  // Fire-and-forget title generation
  if (isFirstMessage && messages.length > 0 && messages[0].role === "user") {
    (async () => {
      try {
        const titleResponse = await generateText({
          model: openai("gpt-3.5-turbo"),
          prompt: `Create a short, descriptive title (max 20 characters) for this conversation based on the user's message: "${messages[0].content}"`,
        });
        chat.title = titleResponse.text.trim().replace(/['"]/g, "");
      } catch (error) {
        console.error("Error generating chat title:", error);
        chat.title = messages[0].content.slice(0, 20);
      } finally {
        await chat.save();
      }
    })();
  }

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

  // Process messages for multi-modal content
  const processedMessages: CoreMessage[] = messages.map(
    (message: Message, index: number) => {
      // Handle multi-modal content for the last user message
      if (message.role === "user" && index === messages.length - 1) {
        const content: ContentItem[] = [];

        // Handle existing content
        if (Array.isArray(message.content)) {
          // Content is already in multi-modal format
          content.push(...message.content);
        } else if (message.content && message.content.trim()) {
          // Add text content
          content.push({ type: "text", text: message.content });
        }

        // Add experimental_attachments (AI SDK format)
        if (
          message.experimental_attachments &&
          message.experimental_attachments.length > 0
        ) {
          for (const attachment of message.experimental_attachments) {
            if (attachment.contentType?.startsWith("image/")) {
              content.push({
                type: "image",
                image: attachment.url,
              });
            }
          }
        }

        // Add custom attachments format
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            if (attachment.type === "image") {
              // Check if image is already in content
              const hasImage = content.some(
                (c) => c.type === "image" && c.image === attachment.url
              );
              if (!hasImage) {
                content.push({
                  type: "image",
                  image: attachment.url,
                });
              }
            } else if (attachment.type === "pdf" && attachment.textContent) {
              // For PDFs, add the extracted text content
              content.push({
                type: "text",
                text: `PDF Content from ${attachment.name}:\n${attachment.textContent}`,
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
    }
  );

  const aiStream = streamText({
    model: mem0("gpt-4o", { user_id: userId }),
    system: systemPrompt,
    messages: processedMessages,
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
  response.headers.set("X-Chat-Id", chatId!);
  return response;
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const chatId = new URL(req.url).searchParams.get("id");
  if (!chatId)
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

  const chat = await Chat.findOne({ chatId, userId }).lean();
  if (!chat)
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const chatData = chat as unknown as {
    chatId: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
  };

  return NextResponse.json({
    chatId: chatData.chatId,
    title: chatData.title,
    messages: chatData.messages,
    createdAt: chatData.createdAt,
    updatedAt: chatData.updatedAt,
  });
}
