import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "ChatId is required" }, { status: 400 });
    }

    const deletedChat = await Chat.findOneAndDelete({ chatId, userId });

    if (!deletedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedChatId: chatId,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
