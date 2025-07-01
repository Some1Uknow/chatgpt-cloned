// api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { streamText, generateText } from "ai";
import { createMem0, retrieveMemories } from "@mem0/vercel-ai-provider";
import { openai } from "@ai-sdk/openai";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { v4 as uuidv4 } from "uuid";

// Allow streaming up to 30s
export const maxDuration = 30;

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
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  let chat = await Chat.findOne({ chatId, userId });
  let isFirstMessage = false;

  if (chat) {
    chat.messages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(),
    }));
  } else {
    chatId = uuidv4();
    isFirstMessage = true;
    chat = new Chat({
      chatId,
      userId,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(),
      })),
    });
  }

  await chat.save();

  // Fire-and-forget title generation
  if (isFirstMessage && messages.length > 0 && messages[0].role === "user") {
    (async () => {
      try {
        const titleResponse = await generateText({
          model: mem0("gpt-3.5-turbo"),
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
      { user_id: userId, mem0ApiKey: process.env.MEM0_API_KEY!, limit: 10 }
    );

    if (memoryContext && memoryContext.trim()) {
      systemPrompt = memoryContext;
    }
    console.log("Memory context retrieved:", systemPrompt);
  } catch (error) {
    console.error("Error retrieving memories:", error);
  }

  const aiStream = streamText({
    model: mem0("gpt-4o", { user_id: userId }),
    system: systemPrompt,
    messages,
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

  return NextResponse.json({
    chatId: chat.chatId,
    title: chat.title,
    messages: chat.messages,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  });
}
