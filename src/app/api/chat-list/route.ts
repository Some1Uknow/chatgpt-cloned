import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  // Get all chats for the user, sorted by updatedAt desc
  const chats = await Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .select("chatId title")
    .lean();

  return NextResponse.json({ chats });
}
