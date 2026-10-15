export interface SpatialDimensions {
  estimated_room_type: "living_room" | "bedroom" | "office" | "dining";
  detected_wall_color: string;
  lighting_condition: "bright_daylight" | "warm_indoor" | "dim_ambient";
}

export interface BoundingBox2D {
  ymin: number; // 0 to 1000
  xmin: number; // 0 to 1000
  ymax: number; // 0 to 1000
  xmax: number; // 0 to 1000
}

export interface SuggestedProduct {
  sku_id: string;
  item_name: string;
  category: "seating" | "tables" | "lighting" | "decor";
  price_original: number;
  price_bundle: number;
  dimensions_meters: {
    width: number;
    depth: number;
    height: number;
  };
  bounding_box_2d: BoundingBox2D;
  model_glb_path: string;
  model_usdz_path: string;
  reasoning: string;
  in_stock?: boolean;
  rating?: number;
  reviews_count?: number;
  available_finishes?: Array<{ name: string; hex: string }>;
}

export interface CartItem {
  product: SuggestedProduct;
  quantity: number;
  selectedFinish?: string;
}

export interface NeuroCommerceAIResponse {
  status: "success" | "partial_match" | "fallback";
  spatial_analysis: SpatialDimensions;
  recommended_primary_sku: SuggestedProduct;
  alternative_carousel_skus: SuggestedProduct[];
  agent_voice_summary: string;
}
