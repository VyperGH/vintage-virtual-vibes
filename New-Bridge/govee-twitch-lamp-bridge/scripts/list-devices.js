// Run with: npm run list-devices
// Prints every Govee device on your account so you can find your floor
// lamp's `sku` and `device` id to put into config.json.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listDevices } from "../src/govee.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

function getApiKey() {
  if (fs.existsSync(CONFIG_PATH)) {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (cfg.goveeApiKey && !cfg.goveeApiKey.startsWith("PASTE_")) return cfg.goveeApiKey;
  }
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;
  console.error(
    "No Govee API key found. Either put it in config.json first, or run:\n" +
      "  npm run list-devices -- YOUR_API_KEY\n"
  );
  process.exit(1);
}

const apiKey = getApiKey();

try {
  const devices = await listDevices(apiKey);
  if (!devices || devices.length === 0) {
    console.log("No devices found on this account. Make sure the lamp is set up in the Govee Home app.");
  } else {
    console.log(`\nFound ${devices.length} device(s):\n`);
    for (const d of devices) {
      console.log(`  Name:   ${d.deviceName ?? "(unnamed)"}`);
      console.log(`  sku:    ${d.sku}`);
      console.log(`  device: ${d.device}`);
      console.log("");
    }
    console.log('Copy the "sku" and "device" values for your floor lamp into config.json under "device".');
  }
} catch (err) {
  console.error("Failed to list devices:", err.message);
  process.exit(1);
}
