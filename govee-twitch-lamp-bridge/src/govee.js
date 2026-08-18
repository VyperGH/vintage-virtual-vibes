// Thin wrapper around Govee's official Developer API (v2).
// Docs: https://developer.govee.com/reference/get-you-devices
//       https://developer.govee.com/reference/get-light-scene
//       https://developer.govee.com/reference/control-you-devices

import { randomUUID } from "node:crypto";

const BASE_URL = "https://openapi.api.govee.com";

function newRequestId() {
  return randomUUID();
}

async function govFetch(apiKey, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Govee-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(
      `Govee API ${path} failed: HTTP ${res.status} ${JSON.stringify(json)}`
    );
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}

/** GET (technically a GET, but the Govee SDK conventions here use fetch defaults) list of devices on the account. */
export async function listDevices(apiKey) {
  const res = await fetch(`${BASE_URL}/router/api/v1/user/devices`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Govee-API-Key": apiKey,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Govee list devices failed: HTTP ${res.status} ${JSON.stringify(json)}`);
  }
  return json.data ?? json.payload ?? json;
}

/** List the dynamic light scenes available for a specific device. */
export async function listScenes(apiKey, sku, device) {
  const json = await govFetch(apiKey, "/router/api/v1/device/scenes", {
    requestId: newRequestId(),
    payload: { sku, device },
  });

  const capabilities = json.payload?.capabilities ?? [];
  const dynamicScene = capabilities.find(
    (c) => c.type === "devices.capabilities.dynamic_scene" && c.instance === "lightScene"
  );
  return dynamicScene?.parameters?.options ?? [];
}

/** Activate a dynamic light scene by its paramId/id (as returned by listScenes). */
export async function activateScene(apiKey, sku, device, { paramId, id }) {
  return govFetch(apiKey, "/router/api/v1/device/control", {
    requestId: newRequestId(),
    payload: {
      sku,
      device,
      capability: {
        type: "devices.capabilities.dynamic_scene",
        instance: "lightScene",
        value: { paramId, id },
      },
    },
  });
}
