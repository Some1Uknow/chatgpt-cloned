import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { v4 as uuidv4 } from "uuid";

// Allow streaming up to 30s
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // 1. Auth + DB
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  // 2. Parse incoming
  const url = new URL(req.url);
  let chatId = url.searchParams.get("id");
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  // 3. Create or update the Chat doc (persist user & prior AI messages)
  let chat = await Chat.findOne({ chatId, userId });
  if (chat) {
    chat.messages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(),
    }));
  } else {
    chatId = uuidv4();
    chat = new Chat({
      chatId,
      userId,
      // Persist exactly what the client sent (first user message for new chat)
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(),
      })),
    });
  }
  await chat.save(); // <-- user message(s) and any prior AI messages are now in DB

  // 4. Stream the AI response and append it on completion
  const aiStream = streamText({
    model: openai("gpt-3.5-turbo"),
    system: "You are a helpful assistant.",
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

  // 5. Return a streaming response, with X-Chat-Id header
  const response = aiStream.toDataStreamResponse();
  response.headers.set("X-Chat-Id", chatId!);
  return response;
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  const url = new URL(req.url);
  const chatId = url.searchParams.get("id");
  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
  }

  const chat = await Chat.findOne({ chatId, userId }).lean();
  if (!chat || Array.isArray(chat)) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json({
    chatId: (chat as any).chatId,
    title: (chat as any).title,
    messages: (chat as any).messages,
    createdAt: (chat as any).createdAt,
    updatedAt: (chat as any).updatedAt,
  });
}
