import express from "express";
import { loadConfig } from "./config.js";
import { createSceneRunner } from "./sceneRunner.js";
import { ensureAuthenticated } from "./twitchAuth.js";
import { startEventSub } from "./twitchEventSub.js";

const config = loadConfig();
const { goveeApiKey, device, scenes, idleScene, twitch } = config;
const port = config.port ?? 4750;
const minDelayMs = config.minDelayBetweenCommandsMs ?? 350;

function requireField(value, message) {
  if (!value || (typeof value === "string" && value.startsWith("PASTE_"))) {
    console.error(message);
    process.exit(1);
  }
}

requireField(goveeApiKey, "config.json is missing a real goveeApiKey.");
requireField(device?.sku, "config.json is missing a real device.sku. Run `npm run list-devices` first.");
requireField(device?.id, "config.json is missing a real device.id. Run `npm run list-devices` first.");
requireField(twitch?.clientId, "config.json is missing twitch.clientId — see README for how to register a Twitch app.");
requireField(twitch?.clientSecret, "config.json is missing twitch.clientSecret.");

const sceneRunner = createSceneRunner({ goveeApiKey, device, scenes, idleScene, minDelayMs });

// --- Small local HTTP server, mainly for manual testing (and usable from
// anything else that can hit a URL, e.g. a Stream Deck button). ---
const app = express();

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Govee Twitch Lamp Bridge is running.",
    device: `${device.sku} / ${device.id}`,
    knownEvents: Object.keys(scenes ?? {}),
  });
});

function handleTrigger(req, res) {
  const result = sceneRunner.trigger(req.params.key.toLowerCase());
  res.status(result.ok ? 200 : result.error?.includes("not configured yet") ? 400 : 404).json(result);
}

app.get("/trigger/:key", handleTrigger);
app.get("/test/:key", handleTrigger);

app.listen(port, () => {
  console.log(`Local bridge listening on http://localhost:${port} (try http://localhost:${port}/test/follow)`);
});

// --- Twitch login + EventSub ---
const authPort = twitch.authPort ?? 3939;
const redirectUri = twitch.redirectUri ?? `http://localhost:${authPort}/auth/callback`;

const tokens = await ensureAuthenticated({
  clientId: twitch.clientId,
  clientSecret: twitch.clientSecret,
  redirectUri,
  port: authPort,
});

console.log(`Logged into Twitch as ${tokens.login}.`);

startEventSub({
  clientId: twitch.clientId,
  accessToken: tokens.accessToken,
  userId: tokens.userId,
  onStatus: (msg) => console.log(msg),
  onEvent: (key, event) => {
    console.log(`Twitch event: ${key} — ${summarize(key, event)}`);
    sceneRunner.trigger(key, { label: key });
  },
});

function summarize(key, event) {
  switch (key) {
    case "follow":
      return event.user_name;
    case "subscribe":
      return `${event.user_name} (tier ${event.tier})`;
    case "resub":
      return `${event.user_name} (tier ${event.tier}, ${event.cumulative_months ?? "?"} months)`;
    case "giftsub":
      return `${event.is_anonymous ? "anonymous" : event.user_name} gifted ${event.total} (tier ${event.tier})`;
    case "cheer":
      return `${event.is_anonymous ? "anonymous" : event.user_name} — ${event.bits} bits`;
    case "raid":
      return `${event.from_broadcaster_user_name} with ${event.viewers} viewers`;
    default:
      return "";
  }
}
