// Owns the actual "make the lamp do a thing" logic: a serial queue (so a
// burst of events doesn't slam Govee's API or land out of order on the
// lamp) plus optional auto-revert to an idle scene after each trigger.

import { activateScene } from "./govee.js";

export function createSceneRunner({ goveeApiKey, device, scenes, idleScene, minDelayMs = 350 }) {
  let queue = Promise.resolve();
  let revertTimer = null;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function enqueue(task) {
    queue = queue.then(() => task().catch((err) => console.error(err.message || err)));
    return queue;
  }

  async function runScene(key, sceneConfig, label) {
    if (revertTimer) {
      clearTimeout(revertTimer);
      revertTimer = null;
    }

    console.log(`-> ${label}: activating scene "${sceneConfig.name}"`);
    await activateScene(goveeApiKey, device.sku, device.id, sceneConfig);
    await wait(minDelayMs);

    const revertAfterMs = sceneConfig.revertAfterMs ?? 0;
    if (revertAfterMs > 0 && idleScene?.paramId && idleScene?.id) {
      revertTimer = setTimeout(() => {
        enqueue(async () => {
          console.log(`<- ${label}: reverting to "${idleScene.name}"`);
          await activateScene(goveeApiKey, device.sku, device.id, idleScene);
        });
      }, revertAfterMs);
    }
  }

  function trigger(key, { label } = {}) {
    const sceneConfig = scenes?.[key];

    if (!sceneConfig) {
      console.warn(`No scene configured for event "${key}"`);
      return { ok: false, error: `No scene configured for "${key}"` };
    }
    if (!sceneConfig.paramId && !sceneConfig.id) {
      console.warn(`Scene for "${key}" is still a placeholder — fill it in via npm run list-scenes`);
      return { ok: false, error: `Scene for "${key}" is not configured yet` };
    }

    enqueue(() => runScene(key, sceneConfig, label ?? key));
    return { ok: true, queued: key };
  }

  return { trigger };
}
