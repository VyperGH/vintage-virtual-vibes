# Govee Twitch Lamp Bridge

Makes your Govee floor lamp play a specific **light scene** when someone
Follows, Subs, Cheers, or Raids on Twitch.

## Why this exists

Lumia Stream already listens to Twitch and can react to alerts, but its
built-in Govee integration can't fire a specific saved **scene** (like
"Sunrise" or "Fireworks") — Govee only exposes scene control through its
separate Developer API, not through the simple color/brightness commands
most integrations (including Lumia's) use. Calling that API straight from
Lumia's sandboxed alert scripts also tends to get blocked by the browser's
CORS rules, since Govee's API isn't built to be called from a browser.

This project is the missing piece: a tiny local server that sits between
Lumia and Govee.

```
Twitch event → Lumia Stream (already set up) → Custom JavaScript action
  → this bridge (localhost) → Govee Cloud API → your lamp
```

Lumia keeps doing everything else it already does (chat, overlays, other
alerts) — this only handles the "play this exact scene" part it can't do
on its own.

## Requirements

- Node.js 18 or newer (check with `node --version`)
- A Govee Developer API key (Govee Home app → Profile → Settings → About
  Us → tap the version number a few times if needed → "Apply for API
  Key" — you said you already have one)
- Lumia Stream desktop app, already connected to your Twitch channel

## Setup

1. **Install dependencies**

   ```
   npm install
   ```

2. **Create your config file**

   ```
   cp config.example.json config.json
   ```

   Open `config.json` and paste in your Govee API key.

3. **Find your lamp's device ID**

   ```
   npm run list-devices
   ```

   This prints every device on your Govee account. Copy the `sku` and
   `device` values for the floor lamp into `config.json` under
   `"device"`.

4. **List the scenes your lamp supports**

   ```
   npm run list-scenes
   ```

   This prints every dynamic scene saved on that device (the same ones
   you'd see in the Govee Home app), each with a `paramId`/`id` pair.
   For each Twitch event in `config.json`'s `"scenes"` section, replace
   the placeholder with the scene name and its `paramId`/`id`.

   Example:

   ```json
   "follow": { "name": "Sunrise", "paramId": 1234, "id": 5678, "revertAfterMs": 8000 }
   ```

   `revertAfterMs` is optional — if set, the lamp automatically returns
   to `idleScene` (also in `config.json`) after that many milliseconds.
   Set it to `0` to just leave the scene running. Leave `idleScene`'s
   `paramId`/`id` as `0` if you don't want auto-revert at all.

   > Note: a few Govee products only expose their scene library inside
   > the Govee Home app and not through the public API. If
   > `list-scenes` comes back empty, check your lamp's model page on
   > [developer.govee.com](https://developer.govee.com) for API support.

5. **Start the bridge**

   ```
   npm start
   ```

   Leave this running in a terminal (or background it — see
   "Keeping it running" below) whenever you're streaming. You should
   see:

   ```
   Govee Twitch Lamp Bridge listening on http://localhost:4750
   ```

6. **Test it without waiting for a real follow**

   Visit `http://localhost:4750/test/follow` in a browser, or run:

   ```
   curl http://localhost:4750/test/follow
   ```

   Your lamp should switch to whatever scene you configured for
   `follow`.

## Wiring it up in Lumia Stream

For each alert you want to trigger a scene (Follow, Subscribe, Resub,
Gift Sub, Bits/Cheer, Raid):

1. In Lumia, go to the **Alerts** tab and open that alert's settings.
2. Add a new action → **Custom JavaScript**.
3. Paste this in, swapping `follow` for the matching key from
   `config.json` (`follow`, `subscribe`, `resub`, `giftsub`, `cheer`,
   `raid`):

   ```js
   async function () {
     fetch('http://localhost:4750/trigger/follow').catch(() => {});
     done();
   }
   ```

4. Save. That's it — Lumia still owns Twitch detection and everything
   else about that alert; it just also pings your lamp now.

Repeat for each alert, changing only the `/trigger/<key>` at the end of
the URL. If Lumia's alert list splits subs differently than expected
(e.g. no separate "Resub" alert), just point that alert's script at
whichever `config.json` key makes sense, or reuse `subscribe` for all
of them.

## Keeping it running

The bridge is just a small Node process — it needs to be running
whenever you go live, same as Lumia. A few options:

- Simplest: keep a terminal window open with `npm start` running,
  minimized during your stream.
- Auto-start with your PC/stream setup: use `pm2` (`npm i -g pm2`,
  then `pm2 start src/server.js --name govee-bridge`), a Windows Task
  Scheduler entry, or a macOS/Linux launch agent.

## Troubleshooting

- **404 "No scene configured for..."** — the key in the URL doesn't
  match a key under `"scenes"` in `config.json`.
- **400 "Scene for ... is not configured yet"** — you still have a
  placeholder (`paramId`/`id` of `0`) for that event; run
  `npm run list-scenes` and fill it in.
- **Nothing happens when Lumia fires the alert** — open Lumia's script
  console/logs for that alert to confirm the `fetch()` actually ran, and
  check the bridge's terminal for a log line. Make sure the bridge is
  running on the same machine as Lumia and the port matches.
- **Govee API errors in the terminal** — Govee's API allows roughly
  30 requests/minute per account; a huge raid + sub train in the same
  minute could hit that. The bridge already queues and spaces out
  calls (`minDelayBetweenCommandsMs` in `config.json`) to help with
  this — raise that value if you still see 429 errors.

## Project layout

```
config.example.json   Template — copy to config.json and fill in
src/govee.js           Govee Developer API v2 client (list devices/scenes, activate scenes)
src/server.js           The local HTTP bridge Lumia's Custom JavaScript calls
scripts/list-devices.js Helper: prints your Govee devices
scripts/list-scenes.js  Helper: prints a device's scenes with their paramId/id
```
