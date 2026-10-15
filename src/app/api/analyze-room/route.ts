import { NextRequest, NextResponse } from "next/server";
import { processRoomKeyframes } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images = [], prompt = "", apiKey } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one keyframe image is required." },
        { status: 400 }
      );
    }

    const result = await processRoomKeyframes(images, prompt, apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/analyze-room error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process spatial room keyframes.",
      },
      { status: 500 }
    );
  }
}
