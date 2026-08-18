// Handles logging into Twitch as YOU (the broadcaster) via the OAuth
// Authorization Code flow, and keeping that login refreshed on future runs.
//
// We need a *user* access token (not a simple app token) because reading
// your own followers, subscribers, and bit cheers all require scopes that
// only a user token can carry:
//   - moderator:read:followers   (channel.follow)
//   - channel:read:subscriptions (channel.subscribe / .gift / .message)
//   - bits:read                  (channel.cheer)

import http from "node:http";
import { URL } from "node:url";
import { loadTokens, saveTokens } from "./config.js";

const SCOPES = ["moderator:read:followers", "channel:read:subscriptions", "bits:read"];

export function buildAuthUrl(clientId, redirectUri) {
  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  return url.toString();
}

async function exchangeCodeForTokens({ clientId, clientSecret, redirectUri, code }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(`Twitch token exchange failed: ${JSON.stringify(json)}`);
  return json;
}

export async function refreshTokens({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(`Twitch token refresh failed: ${JSON.stringify(json)}`);
  return json;
}

async function fetchSelf(accessToken, clientId) {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: { Authorization: `Bearer ${accessToken}`, "Client-Id": clientId },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Failed to look up your Twitch account: ${JSON.stringify(json)}`);
  return json.data[0];
}

function tokensFromResponse(tokenResponse) {
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    scope: tokenResponse.scope,
  };
}

/**
 * Ensures we have a valid Twitch user access token with the scopes this
 * bridge needs. Runs a one-time browser login the first time it's ever
 * called (no saved tokens.json yet); every run after that just silently
 * refreshes the saved login.
 */
export async function ensureAuthenticated({ clientId, clientSecret, redirectUri, port }) {
  let tokens = loadTokens();

  if (tokens?.refreshToken) {
    try {
      const refreshed = await refreshTokens({ clientId, clientSecret, refreshToken: tokens.refreshToken });
      tokens = { ...tokens, ...tokensFromResponse(refreshed) };
      saveTokens(tokens);
    } catch (err) {
      console.warn("Saved Twitch login could not be refreshed, you'll need to log in again:", err.message);
      tokens = null;
    }
  }

  if (!tokens) {
    tokens = await runAuthorizationCodeFlow({ clientId, clientSecret, redirectUri, port });
    saveTokens(tokens);
  }

  const self = await fetchSelf(tokens.accessToken, clientId);
  tokens.userId = self.id;
  tokens.login = self.login;
  saveTokens(tokens);

  return tokens;
}

function runAuthorizationCodeFlow({ clientId, clientSecret, redirectUri, port }) {
  return new Promise((resolve, reject) => {
    const authUrl = buildAuthUrl(clientId, redirectUri);

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${port}`);
        if (url.pathname !== "/auth/callback") {
          res.writeHead(404).end();
          return;
        }

        const error = url.searchParams.get("error");
        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<h1>Twitch login failed</h1><p>${url.searchParams.get("error_description") || error}</p>`);
          server.close();
          reject(new Error(`Twitch authorization denied: ${error}`));
          return;
        }

        const code = url.searchParams.get("code");
        const tokenResponse = await exchangeCodeForTokens({ clientId, clientSecret, redirectUri, code });

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Twitch login successful — you can close this tab.</h1>");
        server.close();
        resolve(tokensFromResponse(tokenResponse));
      } catch (err) {
        res.writeHead(500).end("Something went wrong, check the terminal.");
        server.close();
        reject(err);
      }
    });

    server.listen(port, async () => {
      console.log("\nFirst-time setup: opening your browser so you can log in with Twitch...");
      console.log(`If it doesn't open automatically, visit this URL:\n  ${authUrl}\n`);
      try {
        const { default: open } = await import("open");
        await open(authUrl);
      } catch {
        // "open" not available on this platform - the printed URL above still works.
      }
    });

    server.on("error", (err) => {
      reject(new Error(`Could not start the local login server on port ${port}: ${err.message}`));
    });
  });
}
