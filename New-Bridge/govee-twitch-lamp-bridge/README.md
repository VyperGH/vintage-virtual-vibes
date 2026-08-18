# Govee Twitch Lamp Bridge

Makes your Govee floor lamp play a specific **light scene** when someone
Follows, Subs, Resubs, Gift-Subs, Cheers, or Raids on Twitch.

This is a fully standalone app — it does **not** depend on Lumia Stream
or any other third-party tool. It talks to Twitch and Govee directly.

## Why it's built this way

Govee only exposes scene control (like "Sunrise" or "Fireworks", the
same scenes you see in the Govee Home app) through its separate
Developer API — most streaming tools' Govee integrations only do simple
color/brightness, not scenes. So this app connects to Twitch itself
(over EventSub, the same real-time event feed alert tools use) and
calls Govee's scene API directly when something happens:

```
Twitch (EventSub) → this app → Govee Cloud API → your lamp
```

## Requirements

- Node.js 18 or newer (check with `node --version`)
- A Govee Developer API key (Govee Home app → Profile → Settings →
  About Us → "Apply for API Key" — you said you already have one)
- A free Twitch Developer application (a couple minutes to set up —
  steps below)

## Setup

### 1. Install dependencies

```
npm install
```

### 2. Register a Twitch application

1. Go to [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
   and log in with your streaming account.
2. Click **Register Your Application**.
   - **Name:** anything, e.g. "My Lamp Bridge"
   - **OAuth Redirect URLs:** `http://localhost:3939/auth/callback`
     (must match exactly — no trailing slash. If you change
     `twitch.authPort` in `config.json` later, update this to match.)
   - **Category:** anything reasonable, e.g. "Application Integration"
3. Click **Create**, then open the app and click **New Secret** to
   generate a Client Secret.
4. You'll need the **Client ID** and **Client Secret** in step 4 below.
   Keep the secret private — treat it like a password.

### 3. Create your config file

```
cp config.example.json config.json
```

Open `config.json` and fill in:
- `goveeApiKey` — your Govee API key
- `twitch.clientId` / `twitch.clientSecret` — from step 2

### 4. Find your lamp's device ID

```
npm run list-devices
```

Prints every device on your Govee account. Copy the `sku` and `device`
values for the floor lamp into `config.json` under `"device"`.

### 5. List the scenes your lamp supports

```
npm run list-scenes
```

Prints every dynamic scene saved on that device, each with a
`paramId`/`id` pair. For each Twitch event under `config.json`'s
`"scenes"` section, replace the placeholder with the scene name and its
`paramId`/`id`:

```json
"follow": { "name": "Sunrise", "paramId": 1234, "id": 5678, "revertAfterMs": 8000 }
```

`revertAfterMs` is optional — if set, the lamp automatically returns to
`idleScene` (also in `config.json`) after that many milliseconds. Set
it to `0` to just leave the scene running. Leave `idleScene`'s
`paramId`/`id` as `0` if you don't want auto-revert at all.

> Note: a few Govee products only expose their scene library inside the
> Govee Home app and not through the public API. If `list-scenes` comes
> back empty, check your lamp's model page on
> [developer.govee.com](https://developer.govee.com) for API support.

### 6. Start it

```
npm start
```

The **first time** you run this, a browser window opens asking you to
log in to Twitch and approve permissions (reading your followers,
subscribers, and bit cheers — this is your own channel's data, nothing
is posted or changed on Twitch). Approve it, then close the tab. Your
login is saved locally in `tokens.json` and silently refreshed on every
run after that — you won't see the browser step again unless you
delete `tokens.json` or revoke access.

Once connected you'll see something like:

```
Local bridge listening on http://localhost:4750 (try http://localhost:4750/test/follow)
Logged into Twitch as yourchannel.
Connected to Twitch EventSub.
EventSub session established. Subscribing to events...
  subscribed: channel.follow
  subscribed: channel.subscribe
  subscribed: channel.subscription.gift
  subscribed: channel.subscription.message
  subscribed: channel.cheer
  subscribed: channel.raid
```

Leave this running whenever you're live (see "Keeping it running"
below).

### 7. Test it without waiting for a real follow

```
curl http://localhost:4750/test/follow
```

(or just visit that URL in a browser). Your lamp should switch to
whatever scene you configured for `follow`.

## Keeping it running

This needs to be running whenever you go live, same as OBS.

- Simplest: keep a terminal window open with `npm start` running,
  minimized during your stream.
- Auto-start with your PC/stream setup: use `pm2` (`npm i -g pm2`,
  then `pm2 start src/server.js --name govee-bridge`), a Windows Task
  Scheduler entry, or a macOS/Linux launch agent.

## A couple of behavior notes

- **Gift sub bombs:** when someone gifts subs, Twitch fires one
  "gift" event for the whole action plus one "subscribe" event *per
  recipient*. To stop the lamp from flashing through your whole scene
  list on a 50-sub bomb, this app only reacts to the gifting event
  (`giftsub`) and ignores the individual recipient events.
- **Rate limits:** Govee's API allows roughly 30 requests/minute per
  account. A huge raid + sub train in the same minute could approach
  that. Events are queued and spaced out (`minDelayBetweenCommandsMs`
  in `config.json`) to help — raise that value if you see 429 errors
  in the terminal.
- **Reconnects:** if Twitch drops the connection or asks the app to
  move to a new session, it reconnects and re-subscribes automatically
  — no restart needed.

## Troubleshooting

- **"config.json is missing a real twitch.clientId"** — you still have
  the placeholder value; go back to step 2/3.
- **Browser login fails / "redirect_mismatch"** — the OAuth Redirect
  URL registered on dev.twitch.tv must exactly match
  `http://localhost:3939/auth/callback` (or whatever `authPort` you set).
- **404 "No scene configured for..."** at `/test/<key>` — the key
  doesn't match one under `"scenes"` in `config.json`.
- **400 "Scene for ... is not configured yet"** — you still have a
  placeholder (`paramId`/`id` of `0`); run `npm run list-scenes` and
  fill it in.
- **Nothing happens on a real event** — check the terminal for a
  `Twitch event: ...` log line. If you don't see one, confirm the
  subscriptions all showed `subscribed:` (not `FAILED`) on startup —
  a `FAILED to subscribe` line usually means a missing scope, which
  means you need to delete `tokens.json` and log in again so the new
  scope is requested.

## Project layout

```
config.example.json    Template — copy to config.json and fill in
src/govee.js            Govee Developer API v2 client (list devices/scenes, activate scenes)
src/twitchAuth.js        Twitch OAuth login + token refresh
src/twitchEventSub.js    Twitch EventSub WebSocket client (subscribes, parses events, reconnects)
src/sceneRunner.js       Serial queue + auto-revert logic shared by both the HTTP test routes and live Twitch events
src/server.js            Main entrypoint — wires everything together
scripts/list-devices.js  Helper: prints your Govee devices
scripts/list-scenes.js   Helper: prints a device's scenes with their paramId/id
test/                    Throwaway integration smoke tests (not needed to run the app)
```
