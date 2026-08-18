// Run with: npm run list-scenes
// Prints every dynamic light scene available for your lamp, with the
// paramId/id values you need to paste into config.json's "scenes" section.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listScenes } from "../src/govee.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("No config.json found. Copy config.example.json to config.json and fill in goveeApiKey + device first.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

const cfg = getConfig();
const apiKey = process.argv[2] || cfg.goveeApiKey;
const sku = process.argv[3] || cfg.device?.sku;
const device = process.argv[4] || cfg.device?.id;

if (!apiKey || apiKey.startsWith("PASTE_")) {
  console.error("Missing Govee API key. Put it in config.json or pass it as the first argument.");
  process.exit(1);
}
if (!sku || !device || sku.startsWith("PASTE_")) {
  console.error(
    "Missing device sku/id. Run `npm run list-devices` first, fill config.json, or pass:\n" +
      "  npm run list-scenes -- API_KEY SKU DEVICE_ID\n"
  );
  process.exit(1);
}

try {
  const options = await listScenes(apiKey, sku, device);
  if (!options.length) {
    console.log(
      "This device reported no dynamic scenes. Note: some Govee products only expose their\n" +
        "light scenes through the Govee Home app and NOT through the public API — if this list\n" +
        "is empty, check developer.govee.com's device support list for your SKU."
    );
  } else {
    console.log(`\nFound ${options.length} scene(s) for ${sku} / ${device}:\n`);
    for (const opt of options) {
      console.log(
        `  "${opt.name}"  ->  { "paramId": ${opt.value.paramId}, "id": ${opt.value.id} }`
      );
    }
    console.log(
      '\nPaste the paramId/id pair for whichever scene you want into the matching event\n' +
        'in config.json, e.g.:\n' +
        '  "follow": { "name": "Sunrise", "paramId": 1234, "id": 5678, "revertAfterMs": 8000 }\n'
    );
  }
} catch (err) {
  console.error("Failed to list scenes:", err.message);
  process.exit(1);
}
