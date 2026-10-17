import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomImage,
      productName,
      category = "furniture",
      roomType = "living room",
      wallColor = "neutral",
      lightingCondition = "bright daylight",
      apiKey: clientApiKey,
    } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required to generate virtual staging preview." },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Google Gemini native image generation model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    let contentInput: any[];

    if (roomImage) {
      const cleanB64 = roomImage.includes(",") ? roomImage.split(",")[1] : roomImage;
      const stagingPrompt = `Generate a photorealistic high-resolution interior design visualization showing this room virtually staged with the following furniture piece elegantly placed in the space: ${productName} (${category}). Maintain the room's architectural layout, wall tone (${wallColor}), and ${lightingCondition} lighting profile. The furniture should look seamlessly integrated with realistic contact floor shadows and accurate material textures.`;
      contentInput = [
        stagingPrompt,
        {
          inlineData: {
            data: cleanB64,
            mimeType: "image/jpeg",
          },
        },
      ];
    } else {
      const stagingPrompt = `Generate a photorealistic high-resolution interior design visualization showing a contemporary ${roomType} with ${wallColor} walls and ${lightingCondition} lighting, elegantly staged with the following furniture piece: ${productName} (${category}). Centered composition with realistic contact floor shadows and accurate material textures.`;
      contentInput = [stagingPrompt];
    }

    const result = await model.generateContent(contentInput);
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    let stagedImageUrl: string | null = null;
    let descriptionText = "";

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        stagedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (!stagedImageUrl) {
      // In case the model only replied with text description
      return NextResponse.json(
        {
          error: "Model did not return image bytes.",
          text: descriptionText || "Could not generate staged preview image.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      stagedImageUrl,
      description: descriptionText || `Staged with ${productName}`,
    });
  } catch (error: any) {
    console.error("API /api/generate-room-preview error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate virtual room staging preview.",
      },
      { status: 500 }
    );
  }
}
