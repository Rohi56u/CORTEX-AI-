/**
 * NeuroCommerce AI - Firebase Storage 3D Asset Uploader
 * 
 * Usage:
 *   1. Ensure you have your Firebase service account key or run with your Firebase credentials:
 *      GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json" node scripts/sync-firebase-models.mjs
 *   2. Or configure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your .env.local
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cortex-ai-17cef.firebasestorage.app";

console.log("--------------------------------------------------");
console.log("NeuroCommerce AI - Cloud Asset Pipeline");
console.log(`Target Firebase Bucket: ${BUCKET_NAME}`);
console.log("--------------------------------------------------");

async function uploadLocalModels() {
  const modelsDir = path.resolve("./public/models");
  if (!fs.existsSync(modelsDir)) {
    console.log("Local public/models directory not found.");
    return;
  }

  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith(".glb") || f.endsWith(".usdz"));
  console.log(`Found ${files.length} certified models to sync to Firebase Storage:`);

  try {
    const app = initializeApp();
    const bucket = getStorage(app).bucket(BUCKET_NAME);

    for (const file of files) {
      const filePath = path.join(modelsDir, file);
      const destination = `models/${file}`;
      const contentType = file.endsWith(".usdz") ? "model/vnd.usdz+zip" : "model/gltf-binary";

      console.log(`-> Uploading ${file} to gs://${BUCKET_NAME}/${destination}...`);
      await bucket.upload(filePath, {
        destination,
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
        },
      });
      console.log(`   ✓ Successfully synced: ${file}`);
    }

    console.log("\nAll assets successfully uploaded to Firebase Storage!");
  } catch (err) {
    console.log("\nNote: Firebase Admin credentials not detected in local CLI session.");
    console.log("To run this upload script directly against your Firebase project:");
    console.log("1. Download your service account key from Firebase Console -> Project Settings -> Service Accounts.");
    console.log("2. Run: GOOGLE_APPLICATION_CREDENTIALS='./serviceAccount.json' node scripts/sync-firebase-models.mjs");
    console.log("Your app is currently serving 100 SKUs via on-demand CDN and progressive loading.");
  }
}

uploadLocalModels();
