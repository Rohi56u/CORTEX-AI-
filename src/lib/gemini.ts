import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NeuroCommerceAIResponse, SuggestedProduct } from "../types/neurocommerce";

import { CATALOG_PRODUCTS_100 } from "@/data/catalog";

// Complete 100-SKU Spatial Commerce 3D Catalog
export const CATALOG_PRODUCTS: SuggestedProduct[] = CATALOG_PRODUCTS_100;

const neuroCommerceResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    status: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["success", "partial_match", "fallback"],
    },
    spatial_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        estimated_room_type: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["living_room", "bedroom", "office", "dining"],
        },
        detected_wall_color: { type: SchemaType.STRING },
        lighting_condition: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["bright_daylight", "warm_indoor", "dim_ambient"],
        },
      },
      required: [
        "estimated_room_type",
        "detected_wall_color",
        "lighting_condition",
      ],
    },
    recommended_primary_sku: {
      type: SchemaType.OBJECT,
      properties: {
        sku_id: { type: SchemaType.STRING },
        item_name: { type: SchemaType.STRING },
        category: {
          type: SchemaType.STRING,
        },
        price_original: { type: SchemaType.NUMBER },
        price_bundle: { type: SchemaType.NUMBER },
        dimensions_meters: {
          type: SchemaType.OBJECT,
          properties: {
            width: { type: SchemaType.NUMBER },
            depth: { type: SchemaType.NUMBER },
            height: { type: SchemaType.NUMBER },
          },
          required: ["width", "depth", "height"],
        },
        bounding_box_2d: {
          type: SchemaType.OBJECT,
          properties: {
            ymin: { type: SchemaType.NUMBER },
            xmin: { type: SchemaType.NUMBER },
            ymax: { type: SchemaType.NUMBER },
            xmax: { type: SchemaType.NUMBER },
          },
          required: ["ymin", "xmin", "ymax", "xmax"],
        },
        model_glb_path: { type: SchemaType.STRING },
        model_usdz_path: { type: SchemaType.STRING },
        reasoning: { type: SchemaType.STRING },
      },
      required: [
        "sku_id",
        "item_name",
        "category",
        "price_original",
        "price_bundle",
        "dimensions_meters",
        "bounding_box_2d",
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
        ],
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

export async function processRoomKeyframes(
  base64Images: string[],
  userPrompt: string,
  clientApiKey?: string
): Promise<NeuroCommerceAIResponse> {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "mock-key") {
    // High-fidelity fallback when testing without API key
    return generateFallbackResponse(userPrompt);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      // @ts-ignore
      responseSchema: neuroCommerceResponseSchema,
    },
  });

  const imageParts = base64Images.map((b64) => {
    const cleanB64 = b64.includes(",") ? b64.split(",")[1] : b64;
    return {
      inlineData: { data: cleanB64, mimeType: "image/jpeg" },
    };
  });

  const catalogSummary = CATALOG_PRODUCTS.map(
    (p) => `- ${p.sku_id}: ${p.item_name} [${p.category}, room: ${p.room_type || "any"}] ($${p.price_original}/bundle $${p.price_bundle}, dims: ${p.dimensions_meters.width}x${p.dimensions_meters.depth}x${p.dimensions_meters.height}m, glb: ${p.model_glb_path}, usdz: ${p.model_usdz_path})`
  ).join("\n");

  const prompt = `You are NeuroCommerce AI, an intelligent spatial commerce engine.
Analyze these room scan keyframes and the user's intent: "${userPrompt || "Find furniture that matches my room style and fits the space."}".

Available 100-SKU Spatial 3D Catalog:
${catalogSummary}

Instructions:
1. Estimate room type (living_room, bedroom, office, dining), dominant wall color hex or descriptive tone, and ambient lighting condition.
2. Select the single best matching primary SKU (recommended_primary_sku) that fits the clearance dimensions and color temperature.
3. Select 5 to 7 complementary alternative SKUs (alternative_carousel_skus) from the catalog to form a coordinated interior room suite.
4. Determine normalized bounding box coordinates [0, 1000] for optimal placement in the room viewport.
5. Compose a concise, natural, professional agent voice summary explaining why this piece fits the space.

Return ONLY the structured JSON adhering to the specified schema.`;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const usage = result.response.usageMetadata;
    console.log(
      `📊 [Gemini Token Monitor] Model: ${modelName} | Input: ${usage?.promptTokenCount || 0} tokens | Output: ${usage?.candidatesTokenCount || 0} tokens | Total: ${usage?.totalTokenCount || 0} tokens`
    );
    const text = result.response.text();
    const parsed = JSON.parse(text) as NeuroCommerceAIResponse;

    // Enrich with exact verified catalog paths and finish data
    const enrichProduct = (prod: SuggestedProduct): SuggestedProduct => {
      const found = CATALOG_PRODUCTS.find((p) => p.sku_id === prod.sku_id);
      if (found) {
        return {
          ...found,
          reasoning: prod.reasoning || found.reasoning,
          bounding_box_2d: prod.bounding_box_2d || found.bounding_box_2d,
        };
      }
      return prod;
    };

    return {
      ...parsed,
      recommended_primary_sku: enrichProduct(parsed.recommended_primary_sku),
      alternative_carousel_skus: (parsed.alternative_carousel_skus || []).map(enrichProduct),
    };
  } catch (error) {
    console.error("Gemini API call failed, using fallback:", error);
    return generateFallbackResponse(userPrompt, true);
  }
}

// Stateful rotation so repeated uploads in demo mode visibly change the recommendation!
let fallbackCounter = 0;

export function generateFallbackResponse(
  userPrompt: string,
  wasError: boolean = false
): NeuroCommerceAIResponse {
  fallbackCounter++;
  const lower = userPrompt.toLowerCase();

  const isBedroom = /bed|bedroom|sleep|nightstand/i.test(lower);
  const isOffice = /office|desk|work|executive|study/i.test(lower);
  const isDining = /dining|dinner|table|eat|kitchen/i.test(lower);
  const isLighting = /light|lamp|chandelier|sconce/i.test(lower);
  const isStorage = /shelf|book|storage|credenza|dresser/i.test(lower);

  let targetRoomType: "living_room" | "bedroom" | "office" | "dining" = "living_room";

  if (isBedroom) targetRoomType = "bedroom";
  else if (isOffice) targetRoomType = "office";
  else if (isDining) targetRoomType = "dining";
  else {
    const cycleRooms: Array<"living_room" | "bedroom" | "office" | "dining"> = [
      "living_room",
      "office",
      "dining",
      "bedroom",
    ];
    targetRoomType = cycleRooms[fallbackCounter % cycleRooms.length];
  }

  // Filter 100-SKU catalog by room type or category
  const roomProducts = CATALOG_PRODUCTS.filter((p) => p.room_type === targetRoomType);
  const candidateList = roomProducts.length > 0 ? roomProducts : CATALOG_PRODUCTS;

  let primary = candidateList[fallbackCounter % candidateList.length];
  let alternatives = candidateList
    .filter((p) => p.sku_id !== primary.sku_id)
    .slice(0, 7);

  // If specific category requested, prioritize
  if (isLighting) {
    const lights = CATALOG_PRODUCTS.filter((p) => p.category === "lighting");
    if (lights.length > 0) {
      primary = lights[fallbackCounter % lights.length];
      alternatives = lights.filter((p) => p.sku_id !== primary.sku_id).slice(0, 6);
    }
  } else if (isStorage) {
    const storage = CATALOG_PRODUCTS.filter((p) => p.category === "storage");
    if (storage.length > 0) {
      primary = storage[fallbackCounter % storage.length];
      alternatives = storage.filter((p) => p.sku_id !== primary.sku_id).slice(0, 6);
    }
  }

  const wallColors = ["#E5E1D8 Warm Sand", "#D3D7CF Nordic Clay", "#EFECE6 Pearl White", "#C8BFA7 Coastal Linen"];
  const lightings: Array<"bright_daylight" | "warm_indoor" | "dim_ambient"> = [
    "bright_daylight",
    "warm_indoor",
    "dim_ambient",
  ];

  const wallColor = wallColors[fallbackCounter % wallColors.length];
  const lighting = lightings[fallbackCounter % lightings.length];

  const note = wasError
    ? "(Notice: Gemini API returned an error, high-fidelity spatial simulator used)"
    : "(Notice: Demo simulation active across 100 spatial SKUs. Add your GEMINI_API_KEY to activate live multimodal vision)";

  return {
    status: "success",
    spatial_analysis: {
      estimated_room_type: targetRoomType,
      detected_wall_color: wallColor,
      lighting_condition: lighting,
    },
    recommended_primary_sku: primary,
    alternative_carousel_skus: alternatives,
    agent_voice_summary: `Analyzed space: Identified a ${targetRoomType.replace("_", " ")} setting with ${wallColor} palette. Selected the ${primary.item_name} for ideal scale clearance (${primary.dimensions_meters.width}m W x ${primary.dimensions_meters.depth}m D) and room harmony. ${note}`,
  };
}
