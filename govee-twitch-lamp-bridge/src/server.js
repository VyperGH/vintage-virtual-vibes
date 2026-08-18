import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { activateScene } from "./govee.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(
      `\nNo config.json found at ${CONFIG_PATH}\n` +
        `Copy config.example.json to config.json and fill in your Govee API key, device, and scenes first.\n`
    );
    process.exit(1);
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

const config = loadConfig();
const { goveeApiKey, device, scenes, idleScene } = config;
const port = config.port ?? 4750;
const minDelayMs = config.minDelayBetweenCommandsMs ?? 350;

if (!goveeApiKey || goveeApiKey.startsWith("PASTE_")) {
  console.error("config.json is missing a real goveeApiKey. Fix it and restart.");
  process.exit(1);
}
if (!device?.sku || !device?.id || device.sku.startsWith("PASTE_")) {
  console.error("config.json is missing a real device.sku / device.id. Run `npm run list-devices` first.");
  process.exit(1);
}

// --- A tiny serial queue so rapid-fire events (e.g. a bit train, or a big
// raid + several subs landing at once) don't slam Govee's API and get
// rate-limited or arrive out of order on the lamp. ---
let queue = Promise.resolve();
let revertTimer = null;

function enqueue(task) {
  queue = queue.then(() => task().catch((err) => console.error(err.message || err)));
  return queue;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runScene(key, sceneConfig, { isTest = false } = {}) {
  if (revertTimer) {
    clearTimeout(revertTimer);
    revertTimer = null;
  }

  const label = isTest ? `[TEST] ${key}` : key;
  console.log(`-> ${label}: activating scene "${sceneConfig.name}"`);
  await activateScene(goveeApiKey, device.sku, device.id, sceneConfig);
  await wait(minDelayMs);

  const revertAfterMs = sceneConfig.revertAfterMs ?? 0;
  if (revertAfterMs > 0 && idleScene && idleScene.paramId && idleScene.id) {
    revertTimer = setTimeout(() => {
      enqueue(async () => {
        console.log(`<- ${label}: reverting to "${idleScene.name}"`);
        await activateScene(goveeApiKey, device.sku, device.id, idleScene);
      });
    }, revertAfterMs);
  }
}

const app = express();

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Govee Twitch Lamp Bridge is running.",
    device: `${device.sku} / ${device.id}`,
    knownEvents: Object.keys(scenes ?? {}),
  });
});

function handleTrigger(isTest) {
  return (req, res) => {
    const key = req.params.key.toLowerCase();
    const sceneConfig = scenes?.[key];

    if (!sceneConfig) {
      console.warn(`No scene configured for event "${key}"`);
      res.status(404).json({ ok: false, error: `No scene configured for "${key}"` });
      return;
    }
    if (!sceneConfig.paramId && !sceneConfig.id) {
      console.warn(`Scene for "${key}" is still a placeholder — fill it in via npm run list-scenes`);
      res.status(400).json({ ok: false, error: `Scene for "${key}" is not configured yet` });
      return;
    }

    // Respond immediately; the actual Govee call happens on the queue so
    // we never make Lumia (or Twitch) wait on a slow cloud API call.
    res.json({ ok: true, queued: key });
    enqueue(() => runScene(key, sceneConfig, { isTest }));
  };
}

app.get("/trigger/:key", handleTrigger(false));
app.get("/test/:key", handleTrigger(true));

app.listen(port, () => {
  console.log(`Govee Twitch Lamp Bridge listening on http://localhost:${port}`);
  console.log(`Configured events: ${Object.keys(scenes ?? {}).join(", ")}`);
  console.log(`Try it: http://localhost:${port}/test/follow`);
});
