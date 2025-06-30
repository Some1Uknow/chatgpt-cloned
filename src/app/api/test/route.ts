import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

export async function GET() {
  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt: "What is love?",
  });
  return NextResponse.json({ text });
}
