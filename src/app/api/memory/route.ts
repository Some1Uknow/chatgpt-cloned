// api/memory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { addMemories } from "@mem0/vercel-ai-provider";
import MemoryClient from "mem0ai";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = new MemoryClient({
      apiKey: process.env.MEM0_API_KEY!,
    });

    const filters = {
      AND: [{ user_id: userId }],
    };

    const memories = await client.getAll({
      filters,
      api_version: "v2",
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch memories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memories } = await req.json();

    // const formatted = Array.isArray(memories)
    //   ? memories.map(m => ({ role: "user", content: [{ type: "text", text: m }] }))
    //   : [{ role: "user", content: [{ type: "text", text: memories }] }];
    const memoryArray = Array.isArray(memories) ? memories : [memories];

    const formatted = memoryArray.map((text) => ({
      role: "user" as const,
      content: [{ type: "text" as const, text }],
    }));

    const result = await addMemories(formatted, {
      user_id: userId,
      agent_id: "chat-assistant",
      mem0ApiKey: process.env.MEM0_API_KEY!,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error adding memories:", error);
    return NextResponse.json(
      {
        error: "Failed to add memories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const memoryId = url.searchParams.get("id");
    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.mem0.ai/v1/memories/${memoryId}`, {
      method: "DELETE",
      headers: { Authorization: `Token ${process.env.MEM0_API_KEY!}` },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error || "Delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      {
        error: "Failed to delete memory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
