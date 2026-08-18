// Connects to Twitch's EventSub WebSocket, subscribes to the alerts this
// bridge reacts to, and calls onEvent(key, rawEvent) for each one.
// Docs: https://dev.twitch.tv/docs/eventsub/handling-websocket-events/

import WebSocket from "ws";

const EVENTSUB_WS_URL = "wss://eventsub.wss.twitch.tv/ws";
const HELIX_SUBSCRIPTIONS_URL = "https://api.twitch.tv/helix/eventsub/subscriptions";

function buildSubscriptions(userId) {
  return [
    { type: "channel.follow", version: "2", condition: { broadcaster_user_id: userId, moderator_user_id: userId } },
    { type: "channel.subscribe", version: "1", condition: { broadcaster_user_id: userId } },
    { type: "channel.subscription.gift", version: "1", condition: { broadcaster_user_id: userId } },
    { type: "channel.subscription.message", version: "1", condition: { broadcaster_user_id: userId } },
    { type: "channel.cheer", version: "1", condition: { broadcaster_user_id: userId } },
    { type: "channel.raid", version: "1", condition: { to_broadcaster_user_id: userId } },
  ];
}

async function createSubscription({ clientId, accessToken, sessionId, sub }) {
  const res = await fetch(HELIX_SUBSCRIPTIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: sub.type,
      version: sub.version,
      condition: sub.condition,
      transport: { method: "websocket", session_id: sessionId },
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

function mapNotification(eventType, event, onEvent) {
  switch (eventType) {
    case "channel.follow":
      onEvent("follow", event);
      break;
    case "channel.subscribe":
      // Community-gifted subs also fire one channel.subscribe per
      // recipient. The gifting action itself already triggers "giftsub"
      // once, so skip these to avoid the lamp flashing N times on a bomb.
      if (!event.is_gift) onEvent("subscribe", event);
      break;
    case "channel.subscription.gift":
      onEvent("giftsub", event);
      break;
    case "channel.subscription.message":
      onEvent("resub", event);
      break;
    case "channel.cheer":
      onEvent("cheer", event);
      break;
    case "channel.raid":
      onEvent("raid", event);
      break;
  }
}

/**
 * Connects and subscribes; keeps itself alive and reconnecting until
 * .stop() is called. Never resolves.
 */
export function startEventSub({
  clientId,
  accessToken,
  userId,
  onEvent,
  onStatus = () => {},
  wsUrl = EVENTSUB_WS_URL, // overridable for tests
}) {
  let ws;
  let watchdog;
  let keepaliveSeconds = 30;
  let closedByUs = false;

  function resetWatchdog() {
    clearTimeout(watchdog);
    // Twitch sends a keepalive at least this often; give some slack before
    // deciding the connection is dead and reconnecting.
    watchdog = setTimeout(() => {
      onStatus("No message from Twitch in a while, reconnecting EventSub...");
      ws.terminate();
    }, (keepaliveSeconds + 15) * 1000);
  }

  function connect(url = wsUrl) {
    ws = new WebSocket(url);

    ws.on("open", () => onStatus("Connected to Twitch EventSub."));

    ws.on("message", async (data) => {
      resetWatchdog();
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }

      const type = msg.metadata?.message_type;

      if (type === "session_welcome") {
        keepaliveSeconds = msg.payload.session.keepalive_timeout_seconds || 30;
        resetWatchdog();
        const sessionId = msg.payload.session.id;
        onStatus(`EventSub session established. Subscribing to events...`);
        for (const sub of buildSubscriptions(userId)) {
          try {
            await createSubscription({ clientId, accessToken, sessionId, sub });
            onStatus(`  subscribed: ${sub.type}`);
          } catch (err) {
            onStatus(`  FAILED to subscribe to ${sub.type}: ${err.message}`);
          }
        }
      } else if (type === "session_reconnect") {
        const reconnectUrl = msg.payload.session.reconnect_url;
        onStatus("Twitch asked us to move to a new session, reconnecting...");
        const oldWs = ws;
        connect(reconnectUrl);
        setTimeout(() => oldWs.close(), 5000);
      } else if (type === "notification") {
        mapNotification(msg.payload.subscription.type, msg.payload.event, onEvent);
      } else if (type === "revocation") {
        onStatus(`Subscription revoked: ${msg.payload.subscription.type} (${msg.payload.subscription.status})`);
      }
      // "session_keepalive" needs no handling beyond the resetWatchdog() above.
    });

    ws.on("close", () => {
      clearTimeout(watchdog);
      if (!closedByUs) {
        onStatus("EventSub connection closed unexpectedly, reconnecting in 3s...");
        setTimeout(() => connect(), 3000);
      }
    });

    ws.on("error", (err) => {
      onStatus(`EventSub socket error: ${err.message}`);
    });
  }

  connect();

  return {
    stop() {
      closedByUs = true;
      clearTimeout(watchdog);
      ws?.close();
    },
  };
}
