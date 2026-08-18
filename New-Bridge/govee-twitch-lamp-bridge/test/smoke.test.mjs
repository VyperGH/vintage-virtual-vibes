// Not part of the shipped project — a throwaway integration smoke test to
// verify the EventSub client + scene runner pipeline works end to end
// against a fake Twitch WebSocket + mocked Govee/Twitch HTTP APIs.
// Run with: node test/smoke.test.mjs

import assert from "node:assert/strict";
import { WebSocketServer } from "ws";
import { startEventSub } from "../src/twitchEventSub.js";
import { createSceneRunner } from "../src/sceneRunner.js";

const calls = [];
const originalFetch = global.fetch;

global.fetch = async (url, opts) => {
  const u = url.toString();
  calls.push({ url: u, method: opts?.method });

  if (u.includes("api.twitch.tv/helix/eventsub/subscriptions")) {
    return jsonResponse(200, { data: [{ id: "sub-" + Math.random() }] });
  }
  if (u.includes("openapi.api.govee.com/router/api/v1/device/control")) {
    return jsonResponse(200, { code: 200, message: "success", payload: {} });
  }
  throw new Error("Unexpected fetch in test: " + u);
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function main() {
  const wss = new WebSocketServer({ port: 0 });
  const port = wss.address().port;
  const wsUrl = `ws://localhost:${port}`;

  const receivedEvents = [];

  const sceneRunner = createSceneRunner({
    goveeApiKey: "test-key",
    device: { sku: "H6072", id: "AA:BB:CC:DD:EE:FF:00:11" },
    scenes: {
      cheer: { name: "Fireworks", paramId: 30, id: 40, revertAfterMs: 0 },
      follow: { name: "Sunrise", paramId: 10, id: 20, revertAfterMs: 0 },
    },
    idleScene: { name: "Idle", paramId: 1, id: 1 },
    minDelayMs: 10,
  });

  const handle = startEventSub({
    clientId: "test-client",
    accessToken: "test-token",
    userId: "123",
    wsUrl,
    onStatus: (msg) => console.log("[status]", msg),
    onEvent: (key, event) => {
      receivedEvents.push(key);
      sceneRunner.trigger(key, { label: key });
    },
  });

  const client = await new Promise((resolve) => wss.on("connection", resolve));

  // 1. Send session_welcome, as Twitch would.
  client.send(
    JSON.stringify({
      metadata: { message_type: "session_welcome" },
      payload: { session: { id: "session-123", keepalive_timeout_seconds: 30 } },
    })
  );

  // Give the client a moment to POST all 6 subscription requests.
  await sleep(100);

  const subCalls = calls.filter((c) => c.url.includes("eventsub/subscriptions"));
  assert.equal(subCalls.length, 6, `expected 6 subscription calls, got ${subCalls.length}`);
  console.log("PASS: subscribed to all 6 event types");

  // 2. Send a cheer notification.
  client.send(
    JSON.stringify({
      metadata: { message_type: "notification" },
      payload: {
        subscription: { type: "channel.cheer" },
        event: { user_name: "testviewer", bits: 500, is_anonymous: false },
      },
    })
  );

  // 3. Send a gifted-sub-driven channel.subscribe (should be SKIPPED).
  client.send(
    JSON.stringify({
      metadata: { message_type: "notification" },
      payload: {
        subscription: { type: "channel.subscribe" },
        event: { user_name: "giftrecipient", tier: "1000", is_gift: true },
      },
    })
  );

  // 4. Send an organic channel.subscribe (should fire).
  client.send(
    JSON.stringify({
      metadata: { message_type: "notification" },
      payload: {
        subscription: { type: "channel.subscribe" },
        event: { user_name: "newsub", tier: "1000", is_gift: false },
      },
    })
  );

  await sleep(150);

  assert.deepEqual(receivedEvents, ["cheer", "subscribe"], `unexpected event sequence: ${receivedEvents}`);
  console.log("PASS: cheer fired, gifted channel.subscribe was correctly skipped, organic subscribe fired");

  const goveeCalls = calls.filter((c) => c.url.includes("device/control"));
  assert.equal(goveeCalls.length, 1, `expected 1 Govee control call (cheer only, since 'subscribe' has no scene configured), got ${goveeCalls.length}`);
  console.log("PASS: Govee control API called for the configured 'cheer' scene");

  handle.stop();
  wss.close();
  global.fetch = originalFetch;
  console.log("\nALL SMOKE TESTS PASSED");
  process.exit(0);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
