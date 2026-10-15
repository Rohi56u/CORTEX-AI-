import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const neuroCommerceResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    status: { type: SchemaType.STRING },
    spatial_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        estimated_room_type: { type: SchemaType.STRING },
        detected_wall_color: { type: SchemaType.STRING },
        lighting_condition: { type: SchemaType.STRING },
      },
      required: ["estimated_room_type", "detected_wall_color", "lighting_condition"],
    },
    recommended_primary_sku: {
      type: SchemaType.OBJECT,
      properties: {
        sku_id: { type: SchemaType.STRING },
        item_name: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING },
        price_original: { type: SchemaType.NUMBER },
        price_bundle: { type: SchemaType.NUMBER },
        dimensions_meters: {
          type: SchemaType.OBJECT,
          properties: {
            width: { type: SchemaType.NUMBER },
            depth: { type: SchemaType.NUMBER },
            height: { type: SchemaType.NUMBER },
          },
        },
        bounding_box_2d: {
          type: SchemaType.OBJECT,
          properties: {
            ymin: { type: SchemaType.NUMBER },
            xmin: { type: SchemaType.NUMBER },
            ymax: { type: SchemaType.NUMBER },
            xmax: { type: SchemaType.NUMBER },
          },
        },
        model_glb_path: { type: SchemaType.STRING },
        model_usdz_path: { type: SchemaType.STRING },
        reasoning: { type: SchemaType.STRING },
      },
      required: [
        "sku_id",
        "item_name",
        "price_original",
        "price_bundle",
        "model_glb_path",
        "model_usdz_path",
        "reasoning",
      ],
    },
    alternative_carousel_skus: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sku_id: { type: SchemaType.STRING },
          item_name: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          price_original: { type: SchemaType.NUMBER },
          price_bundle: { type: SchemaType.NUMBER },
          model_glb_path: { type: SchemaType.STRING },
          model_usdz_path: { type: SchemaType.STRING },
          reasoning: { type: SchemaType.STRING },
        },
      },
    },
    agent_voice_summary: { type: SchemaType.STRING },
  },
  required: [
    "status",
    "spatial_analysis",
    "recommended_primary_sku",
    "alternative_carousel_skus",
    "agent_voice_summary",
  ],
};

export const analyzeRoom = onRequest(
  { cors: true, timeoutSeconds: 60, memory: "1GiB" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const { images, prompt = "" } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({ error: "Missing or invalid images array in request body" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          // @ts-ignore
          responseSchema: neuroCommerceResponseSchema,
        },
      });

      const imageParts = images.slice(0, 3).map((b64: string) => {
        const cleanB64 = b64.includes(",") ? b64.split(",")[1] : b64;
        return {
          inlineData: { data: cleanB64, mimeType: "image/jpeg" },
        };
      });

      const systemPrompt = `Analyze these room keyframes and the user request: "${prompt}". 
Select the optimal 3D furniture SKU matches from our catalog, calculate spatial bounding boxes, and return structured JSON.`;

      const result = await model.generateContent([systemPrompt, ...imageParts]);
      const jsonResponse = JSON.parse(result.response.text());

      res.status(200).json(jsonResponse);
    } catch (err: any) {
      console.error("Cloud Function analyzeRoom failed:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  }
);
