const fs = require("fs");
const path = require("path");

// Helper to create a GLB from primitive boxes
function createGLB(boxes) {
  // Each box: { min: [x,y,z], max: [x,y,z], color: [r,g,b] }
  // We'll build vertex positions, normals, and indices.
  let positions = [];
  let normals = [];
  let colors = [];
  let indices = [];
  let vertexOffset = 0;

  for (const box of boxes) {
    const [x0, y0, z0] = box.min;
    const [x1, y1, z1] = box.max;
    const [r, g, b] = box.color || [0.8, 0.8, 0.8];

    // 6 faces of box
    const faces = [
      // +Z face (front)
      {
        norm: [0, 0, 1],
        v: [
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
      },
      // -Z face (back)
      {
        norm: [0, 0, -1],
        v: [
          [x1, y0, z0],
          [x0, y0, z0],
          [x0, y1, z0],
          [x1, y1, z0],
        ],
      },
      // +Y face (top)
      {
        norm: [0, 1, 0],
        v: [
          [x0, y1, z1],
          [x1, y1, z1],
          [x1, y1, z0],
          [x0, y1, z0],
        ],
      },
      // -Y face (bottom)
      {
        norm: [0, -1, 0],
        v: [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y0, z1],
          [x0, y0, z1],
        ],
      },
      // +X face (right)
      {
        norm: [1, 0, 0],
        v: [
          [x1, y0, z1],
          [x1, y0, z0],
          [x1, y1, z0],
          [x1, y1, z1],
        ],
      },
      // -X face (left)
      {
        norm: [-1, 0, 0],
        v: [
          [x0, y0, z0],
          [x0, y0, z1],
          [x0, y1, z1],
          [x0, y1, z0],
        ],
      },
    ];

    for (const face of faces) {
      const baseIdx = vertexOffset;
      for (const pt of face.v) {
        positions.push(...pt);
        normals.push(...face.norm);
        colors.push(r, g, b, 1.0);
        vertexOffset++;
      }
      indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
    }
  }

  // Calculate bounding box
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    min[0] = Math.min(min[0], positions[i]);
    min[1] = Math.min(min[1], positions[i + 1]);
    min[2] = Math.min(min[2], positions[i + 2]);
    max[0] = Math.max(max[0], positions[i]);
    max[1] = Math.max(max[1], positions[i + 1]);
    max[2] = Math.max(max[2], positions[i + 2]);
  }

  const posBuffer = Buffer.from(new Float32Array(positions).buffer);
  const normBuffer = Buffer.from(new Float32Array(normals).buffer);
  const colBuffer = Buffer.from(new Float32Array(colors).buffer);
  const idxBuffer = Buffer.from(new Uint16Array(indices).buffer);

  // Align buffer offsets to 4 bytes
  function pad4(buf) {
    const pad = (4 - (buf.length % 4)) % 4;
    return pad > 0 ? Buffer.concat([buf, Buffer.alloc(pad)]) : buf;
  }

  const pPos = pad4(posBuffer);
  const pNorm = pad4(normBuffer);
  const pCol = pad4(colBuffer);
  const pIdx = pad4(idxBuffer);

  const posOffset = 0;
  const normOffset = posOffset + pPos.length;
  const colOffset = normOffset + pNorm.length;
  const idxOffset = colOffset + pCol.length;
  const binBuffer = Buffer.concat([pPos, pNorm, pCol, pIdx]);

  const gltf = {
    asset: { version: "2.0", generator: "NeuroCommerce AI Asset Generator" },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    scene: 0,
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
              COLOR_0: 2,
            },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          roughnessFactor: 0.6,
          metallicFactor: 0.1,
        },
      },
    ],
    buffers: [{ byteLength: binBuffer.length }],
    bufferViews: [
      { buffer: 0, byteOffset: posOffset, byteLength: posBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: normOffset, byteLength: normBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: colOffset, byteLength: colBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: idxOffset, byteLength: idxBuffer.length, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        max: max,
        min: min,
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: normals.length / 3,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5126,
        count: colors.length / 4,
        type: "VEC4",
      },
      {
        bufferView: 3,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
      },
    ],
  };

  const jsonStr = JSON.stringify(gltf);
  let jsonBuffer = Buffer.from(jsonStr, "utf8");
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  if (jsonPad > 0) {
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from(" ".repeat(jsonPad), "utf8")]);
  }

  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.write("glTF", 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonHeader.write("JSON", 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuffer.length, 0);
  binHeader.write("BIN\0", 4);

  return Buffer.concat([header, jsonHeader, jsonBuffer, binHeader, binBuffer]);
}

// Generate Radiance HDR file
function createHDR(width, height, isNight) {
  const header = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`;
  const headerBuf = Buffer.from(header, "ascii");

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      // Sky gradient
      let r, g, b;
      if (!isNight) {
        // Daytime: warm light and bright cyan/blue sky
        r = 0.6 + 0.4 * (1 - v);
        g = 0.7 + 0.3 * (1 - v);
        b = 0.8 + 0.2 * (1 - v);
      } else {
        // Warm evening / dusk
        r = 0.3 + 0.5 * (1 - v) * Math.sin(u * Math.PI);
        g = 0.15 + 0.25 * (1 - v);
        b = 0.2 + 0.3 * v;
      }
      // Convert float RGB to RGBE
      const maxVal = Math.max(r, g, b);
      if (maxVal < 1e-32) {
        scanlines.push(0, 0, 0, 0);
      } else {
        const exponent = Math.ceil(Math.log2(maxVal));
        const factor = Math.pow(2, -exponent);
        const rgbeR = Math.min(255, Math.floor(r * factor * 256));
        const rgbeG = Math.min(255, Math.floor(g * factor * 256));
        const rgbeB = Math.min(255, Math.floor(b * factor * 256));
        const rgbeE = Math.min(255, Math.max(0, exponent + 128));
        scanlines.push(rgbeR, rgbeG, rgbeB, rgbeE);
      }
    }
  }

  return Buffer.concat([headerBuf, Buffer.from(scanlines)]);
}

// Ensure output directories exist
const modelsDir = path.join(__dirname, "../public/models");
const hdriDir = path.join(__dirname, "../public/hdri");
fs.mkdirSync(modelsDir, { recursive: true });
fs.mkdirSync(hdriDir, { recursive: true });

// 4. Modern Bookshelf GLB
const bookshelfBoxes = [
  // Left vertical side
  { min: [-0.45, 0, -0.15], max: [-0.4, 1.4, 0.15], color: [0.25, 0.18, 0.12] },
  // Right vertical side
  { min: [0.4, 0, -0.15], max: [0.45, 1.4, 0.15], color: [0.25, 0.18, 0.12] },
  // Bottom base
  { min: [-0.45, 0.05, -0.15], max: [0.45, 0.09, 0.15], color: [0.25, 0.18, 0.12] },
  // Shelf 1
  { min: [-0.4, 0.4, -0.14], max: [0.4, 0.43, 0.14], color: [0.35, 0.25, 0.18] },
  // Shelf 2
  { min: [-0.4, 0.75, -0.14], max: [0.4, 0.78, 0.14], color: [0.35, 0.25, 0.18] },
  // Shelf 3
  { min: [-0.4, 1.1, -0.14], max: [0.4, 1.13, 0.14], color: [0.35, 0.25, 0.18] },
  // Top cover
  { min: [-0.45, 1.37, -0.15], max: [0.45, 1.4, 0.15], color: [0.25, 0.18, 0.12] },
  // Books cluster 1
  { min: [-0.35, 0.43, -0.1], max: [-0.2, 0.7, 0.1], color: [0.75, 0.25, 0.2] },
  { min: [-0.2, 0.43, -0.1], max: [-0.08, 0.65, 0.1], color: [0.2, 0.45, 0.7] },
  // Books cluster 2
  { min: [0.1, 0.78, -0.1], max: [0.25, 1.05, 0.1], color: [0.85, 0.7, 0.2] },
];
fs.writeFileSync(path.join(modelsDir, "bookshelf_modern.glb"), createGLB(bookshelfBoxes));

// 5. Executive Leather Lounge Chair GLB
const execChairBoxes = [
  // 5-star swivel base feet
  { min: [-0.35, 0.03, -0.04], max: [0.35, 0.07, 0.04], color: [0.85, 0.85, 0.88] },
  { min: [-0.04, 0.03, -0.35], max: [0.04, 0.07, 0.35], color: [0.85, 0.85, 0.88] },
  // Central pneumatic stem
  { min: [-0.04, 0.07, -0.04], max: [0.04, 0.38, 0.04], color: [0.85, 0.85, 0.88] },
  // Ergonomic seat cushion
  { min: [-0.35, 0.38, -0.32], max: [0.35, 0.48, 0.32], color: [0.28, 0.18, 0.12] },
  // High backrest
  { min: [-0.32, 0.48, -0.32], max: [0.32, 1.05, -0.2], color: [0.28, 0.18, 0.12] },
  // Left armrest
  { min: [-0.38, 0.48, -0.2], max: [-0.32, 0.68, 0.22], color: [0.2, 0.12, 0.08] },
  // Right armrest
  { min: [0.32, 0.48, -0.2], max: [0.38, 0.68, 0.22], color: [0.2, 0.12, 0.08] },
];
fs.writeFileSync(path.join(modelsDir, "chair_executive.glb"), createGLB(execChairBoxes));

// 6. Barn Floor Lamp GLB
const lampBarnBoxes = [
  // Heavy circular base
  { min: [-0.22, 0, -0.22], max: [0.22, 0.04, 0.22], color: [0.12, 0.12, 0.14] },
  // Tall vertical mast
  { min: [-0.02, 0.04, -0.02], max: [0.02, 1.5, 0.02], color: [0.78, 0.65, 0.3] },
  // Angled arm top
  { min: [-0.02, 1.48, -0.02], max: [0.28, 1.52, 0.02], color: [0.78, 0.65, 0.3] },
  // Cone shade
  { min: [0.18, 1.35, -0.12], max: [0.38, 1.48, 0.12], color: [0.15, 0.15, 0.18] },
  // Warm glowing filament/bulb
  { min: [0.25, 1.3, -0.04], max: [0.31, 1.36, 0.04], color: [1.0, 0.9, 0.5] },
];
fs.writeFileSync(path.join(modelsDir, "lamp_barn.glb"), createGLB(lampBarnBoxes));

// 7. Iridescent Pendant / Accent Lamp GLB
const lampIridescenceBoxes = [
  // Base pedestal
  { min: [-0.15, 0, -0.15], max: [0.15, 0.05, 0.15], color: [0.85, 0.8, 0.75] },
  // Central column
  { min: [-0.02, 0.05, -0.02], max: [0.02, 0.35, 0.02], color: [0.85, 0.8, 0.75] },
  // Cylindrical diffuser
  { min: [-0.18, 0.35, -0.18], max: [0.18, 0.75, 0.18], color: [0.4, 0.85, 0.95] },
  // Top brass cap
  { min: [-0.12, 0.75, -0.12], max: [0.12, 0.78, 0.12], color: [0.9, 0.75, 0.3] },
];
fs.writeFileSync(path.join(modelsDir, "lamp_iridescence.glb"), createGLB(lampIridescenceBoxes));

// 8. Potted Monstera / Botanical Planter GLB
const plantPottedBoxes = [
  // Ceramic planter pot
  { min: [-0.2, 0, -0.2], max: [0.2, 0.38, 0.2], color: [0.9, 0.88, 0.84] },
  // Dark potting soil
  { min: [-0.18, 0.36, -0.18], max: [0.18, 0.39, 0.18], color: [0.15, 0.1, 0.05] },
  // Main stem
  { min: [-0.02, 0.38, -0.02], max: [0.02, 0.8, 0.02], color: [0.2, 0.5, 0.2] },
  // Leaf canopy (clustered lush green facets)
  { min: [-0.35, 0.65, -0.3], max: [0.05, 0.85, 0.1], color: [0.15, 0.65, 0.25] },
  { min: [-0.05, 0.7, 0.05], max: [0.35, 0.9, 0.35], color: [0.2, 0.7, 0.3] },
  { min: [-0.2, 0.78, 0.1], max: [0.2, 0.98, 0.3], color: [0.18, 0.6, 0.22] },
];
fs.writeFileSync(path.join(modelsDir, "plant_potted.glb"), createGLB(plantPottedBoxes));

// 9. Velvet Ottoman / Pouf GLB
const poufSilkBoxes = [
  // Plinth base
  { min: [-0.32, 0, -0.32], max: [0.32, 0.06, 0.32], color: [0.75, 0.65, 0.3] },
  // Round plush body
  { min: [-0.35, 0.06, -0.35], max: [0.35, 0.42, 0.35], color: [0.72, 0.35, 0.45] },
  // Tufted top dome
  { min: [-0.3, 0.42, -0.3], max: [0.3, 0.48, 0.3], color: [0.65, 0.3, 0.4] },
];
fs.writeFileSync(path.join(modelsDir, "pouf_silk.glb"), createGLB(poufSilkBoxes));

// Create placeholder USDZ files (zip archives with usdc format metadata)
const emptyZip = Buffer.from([
  0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);
const usdzFiles = [
  "sofa_modern.usdz",
  "table_coffee.usdz",
  "chair_nordic.usdz",
  "bookshelf_modern.usdz",
  "chair_executive.usdz",
  "lamp_barn.usdz",
  "lamp_iridescence.usdz",
  "plant_potted.usdz",
  "pouf_silk.usdz",
];
for (const file of usdzFiles) {
  fs.writeFileSync(path.join(modelsDir, file), emptyZip);
}

// HDR Environment maps (64x32 for high performance loading)
fs.writeFileSync(path.join(hdriDir, "daylight_studio.hdr"), createHDR(64, 32, false));
fs.writeFileSync(path.join(hdriDir, "warm_evening.hdr"), createHDR(64, 32, true));

console.log("All 9 seed 3D models and HDR environment maps created successfully!");

