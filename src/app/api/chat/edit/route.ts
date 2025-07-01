import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { chatId, title } = await req.json();

    if (!chatId || !title) {
      return NextResponse.json(
        { error: "ChatId and title are required" },
        { status: 400 }
      );
    }

    const chat = await Chat.findOneAndUpdate(
      { chatId, userId },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chatId: chat.chatId,
      title: chat.title,
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
