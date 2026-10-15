import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NeuroCommerceAIResponse, SuggestedProduct } from "../types/neurocommerce";

// Catalog of available 3D furniture models
export const CATALOG_PRODUCTS: SuggestedProduct[] = [
  {
    sku_id: "SKU-SOFA-MOD-01",
    item_name: "Aura Minimalist Velvet Sofa",
    category: "seating",
    price_original: 1299,
    price_bundle: 999,
    dimensions_meters: {
      width: 2.1,
      depth: 0.9,
      height: 0.85,
    },
    bounding_box_2d: {
      ymin: 450,
      xmin: 220,
      ymax: 850,
      xmax: 780,
    },
    model_glb_path: "/models/sofa_modern.glb",
    model_usdz_path: "/models/sofa_modern.usdz",
    reasoning:
      "Calculated 2.1m clearance against the primary focal wall. Fabric texture complements neutral wall tones and balances natural illumination.",
    in_stock: true,
    rating: 4.9,
    reviews_count: 148,
    available_finishes: [
      { name: "Ocean Teal Velvet", hex: "#3b8296" },
      { name: "Saddle Bouclé", hex: "#c2b29f" },
      { name: "Charcoal Chenille", hex: "#374151" },
    ],
  },
  {
    sku_id: "SKU-TABLE-COF-02",
    item_name: "Nordic Walnut Oval Coffee Table",
    category: "tables",
    price_original: 450,
    price_bundle: 360,
    dimensions_meters: {
      width: 1.2,
      depth: 0.6,
      height: 0.42,
    },
    bounding_box_2d: {
      ymin: 600,
      xmin: 320,
      ymax: 900,
      xmax: 680,
    },
    model_glb_path: "/models/table_coffee.glb",
    model_usdz_path: "/models/table_coffee.usdz",
    reasoning:
      "Low center of gravity with rounded edges to optimize traffic flow in medium-to-large open living spaces.",
    in_stock: true,
    rating: 4.8,
    reviews_count: 94,
    available_finishes: [
      { name: "Solid American Walnut", hex: "#5c3a21" },
      { name: "Natural Blonde Ash", hex: "#d4b38b" },
      { name: "Midnight Black Oak", hex: "#1f2937" },
    ],
  },
  {
    sku_id: "SKU-CHAIR-ACC-03",
    item_name: "Zenith Sculptural Accent Chair",
    category: "seating",
    price_original: 580,
    price_bundle: 460,
    dimensions_meters: {
      width: 0.82,
      depth: 0.85,
      height: 0.78,
    },
    bounding_box_2d: {
      ymin: 520,
      xmin: 650,
      ymax: 880,
      xmax: 920,
    },
    model_glb_path: "/models/chair_nordic.glb",
    model_usdz_path: "/models/chair_nordic.usdz",
    reasoning:
      "Ergonomic angled silhouette ideal for corner reading nooks and complementary seating pairings.",
    in_stock: true,
    rating: 4.9,
    reviews_count: 76,
    available_finishes: [
      { name: "Warm Wheat Bouclé", hex: "#d8cbb8" },
      { name: "Terracotta Linen", hex: "#b45309" },
      { name: "Forest Moss Velvet", hex: "#15803d" },
    ],
  },
];

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
          format: "enum",
          enum: ["seating", "tables", "lighting", "decor"],
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
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";
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

  const prompt = `You are NeuroCommerce AI, an intelligent spatial commerce engine.
Analyze these room scan keyframes and the user's intent: "${userPrompt || "Find furniture that matches my room style and fits the space."}".

Available 3D Catalog:
1. SKU-SOFA-MOD-01: Aura Minimalist Velvet Sofa (Category: seating, $1299 / bundle $999, dims: 2.1 x 0.9 x 0.85m, models: /models/sofa_modern.glb, /models/sofa_modern.usdz)
2. SKU-TABLE-COF-02: Nordic Walnut Oval Coffee Table (Category: tables, $450 / bundle $360, dims: 1.2 x 0.6 x 0.42m, models: /models/table_coffee.glb, /models/table_coffee.usdz)
3. SKU-CHAIR-ACC-03: Zenith Sculptural Accent Chair (Category: seating, $580 / bundle $460, dims: 0.82 x 0.85 x 0.78m, models: /models/chair_nordic.glb, /models/chair_nordic.usdz)

Instructions:
1. Estimate room type, dominant wall color hex or descriptive tone, and ambient lighting condition.
2. Choose the best matching primary SKU and 2 alternative SKUs from the catalog that match the room aesthetics and user request.
3. Determine normalized bounding box coordinates [0, 1000] for optimal placement reticle in the room viewport.
4. Compose a concise, natural, professional agent voice summary explaining why this piece fits the space.

Return ONLY the structured JSON adhering to the specified schema.`;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();
    return JSON.parse(text) as NeuroCommerceAIResponse;
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
  const isTableIntent = /table|coffee|desk/i.test(userPrompt);
  const isChairIntent = /chair|accent|armchair|seat/i.test(userPrompt);

  let primary = CATALOG_PRODUCTS[fallbackCounter % CATALOG_PRODUCTS.length];
  let alternatives = CATALOG_PRODUCTS.filter((p) => p.sku_id !== primary.sku_id);

  if (isTableIntent) {
    primary = CATALOG_PRODUCTS[1];
    alternatives = [CATALOG_PRODUCTS[0], CATALOG_PRODUCTS[2]];
  } else if (isChairIntent) {
    primary = CATALOG_PRODUCTS[2];
    alternatives = [CATALOG_PRODUCTS[0], CATALOG_PRODUCTS[1]];
  }

  const roomTypes: Array<"living_room" | "bedroom" | "office" | "dining"> = [
    "living_room",
    "office",
    "living_room",
  ];
  const wallColors = ["#E5E1D8 Warm Sand", "#D3D7CF Nordic Clay", "#EFECE6 Pearl White"];
  const lightings: Array<"bright_daylight" | "warm_indoor" | "dim_ambient"> = [
    "bright_daylight",
    "warm_indoor",
    "dim_ambient",
  ];

  const roomType = roomTypes[fallbackCounter % roomTypes.length];
  const wallColor = wallColors[fallbackCounter % wallColors.length];
  const lighting = lightings[fallbackCounter % lightings.length];

  const note = wasError
    ? "(Notice: Gemini API returned an error, high-fidelity spatial simulator used)"
    : "(Notice: Demo simulation active. Add your GEMINI_API_KEY in .env.local to activate live multimodal vision)";

  return {
    status: "success",
    spatial_analysis: {
      estimated_room_type: roomType,
      detected_wall_color: wallColor,
      lighting_condition: lighting,
    },
    recommended_primary_sku: primary,
    alternative_carousel_skus: alternatives,
    agent_voice_summary: `Analyzed room layout: Identified a ${roomType.replace("_", " ")} space with ${wallColor} palette. Recommended the ${primary.item_name} for ideal scale and flow. ${note}`,
  };
}
