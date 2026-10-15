# NeuroCommerce AI 🛋️✨

**NeuroCommerce AI** is a next-generation spatial commerce engine and HUD interface. It captures a 15-second room scan with user voice intent, analyzes spatial dimensions with Google Gemini 1.5 Pro, and visualizes interactive 3D furniture models in WebXR AR and Studio 3D Canvas.

---

## 🛠️ System Architecture

```text
                          ┌──────────────────────────┐
                          │   Next.js 14 Web App     │
                          │   (App Router + Tailwind)│
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
 ┌───────────────────┐                                     ┌───────────────────┐
 │ Camera & Speech   │                                     │ WebXR Viewport    │
 │ Capture (15s MP4) │                                     │ (<model-viewer>)  │
 └─────────┬─────────┘                                     └─────────▲─────────┘
           │                                                         │
           ▼                                                         │
 ┌─────────────────────────────────────────────────────────┐         │
 │ Firebase Cloud Functions (Node.js/TypeScript)           │         │
 │ ├─► Extracts 3 Keyframe JPEGs                           │         │
 │ ├─► Passes JPEGs + Prompt to Gemini 1.5 Pro             │─────────┘
 │ └─► Enforces Strict JSON Schema Output                  │ Structured JSON
 └─────────────────────────────────────────────────────────┘ Payload
```

---

## 📂 Project Directory Structure

```text
NeuroCommerce/
├── public/
│   ├── hdri/
│   │   ├── daylight_studio.hdr        # Daytime HDRI lighting map
│   │   └── warm_evening.hdr           # Sunset/evening HDRI lighting map
│   └── models/
│       ├── chair_nordic.glb / .usdz   # Sculptural accent chair 3D model
│       ├── sofa_modern.glb / .usdz    # Minimalist velvet sofa 3D model
│       └── table_coffee.glb / .usdz   # Nordic coffee table 3D model
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-room/route.ts  # Next.js API route fallback for Gemini
│   │   ├── globals.css                # Dark spatial commerce styles
│   │   ├── layout.tsx                 # Root layout with WebXR meta tags
│   │   └── page.tsx                   # Main HUD & Viewport Controller
│   ├── components/
│   │   ├── ARViewport.tsx             # <model-viewer> wrapper with Reticle Placement
│   │   ├── BottomSKUCarousel.tsx      # Recommended Furniture Swiper UI
│   │   ├── CameraCapture.tsx          # 15s Video + Voice Prompt recorder
│   │   ├── LightingToggle.tsx         # HDRI Day/Night Environment Map Switcher
│   │   └── ModeSwitchHUD.tsx          # Dual-Mode (WebXR AR vs 3D Studio Canvas)
│   ├── config/
│   │   └── firebase.ts                # Firebase client configuration
│   ├── lib/
│   │   └── gemini.ts                  # Gemini 1.5 Pro structured JSON client
│   └── types/
│       ├── model-viewer.d.ts          # Web Component JSX intrinsic types
│       └── neurocommerce.ts           # Strict spatial interfaces & schemas
├── functions/                         # Firebase Cloud Functions (v2 HTTPS)
│   ├── src/
│   │   └── index.ts                   # Keyframe extraction & Gemini caller
│   └── package.json
├── scripts/
│   └── generate_assets.js             # 3D GLB & HDR map generator
├── firebase.json                      # Firebase project configuration
└── package.json
```

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Gemini API Key:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-1.5-pro
```

> **Note:** If `GEMINI_API_KEY` is omitted, the engine automatically operates in high-fidelity simulation mode with realistic spatial measurements and recommendations.

### 2. Start the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Core Features

1. **Dual-Mode HUD (`ModeSwitchHUD`)**:
   - **WebXR AR Mode**: Surface plane detection reticle, AR button for ARCore/Scene Viewer/Quick Look.
   - **3D Studio Canvas**: Smooth auto-rotation, lighting map studio reflection, interactive inspection controls.
2. **15-Second Room Scan & Voice Capture (`CameraCapture`)**:
   - Automatic 15s countdown with progress bar.
   - Live microphone speech-to-text capture for user styling intent.
   - Canvas-based keyframe extraction (3 high-fidelity JPEGs).
   - Instant 1-click demo scan fallback for rapid testing without webcams.
3. **Structured Gemini 1.5 Pro Engine (`src/lib/gemini.ts`)**:
   - Enforces strict JSON Schema for room type, detected wall colors, lighting profiles, and 2D bounding boxes.
4. **Day/Night HDRI Lighting Switcher (`LightingToggle`)**:
   - Toggle between `daylight_studio.hdr` and `warm_evening.hdr`.
5. **Bottom SKU Swiper Carousel (`BottomSKUCarousel`)**:
   - Primary matching item and alternative recommendations.
   - Shows bundle discounts, spatial dimensions in meters, and AI match reasoning.
