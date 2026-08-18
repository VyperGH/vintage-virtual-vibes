// Throwaway smoke test for the token-refresh path (the common case on every
// run after the first). Run with: node test/auth.test.mjs

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(__dirname, "..", "tokens.json");

fs.writeFileSync(
  TOKENS_PATH,
  JSON.stringify({
    accessToken: "old-access-token",
    refreshToken: "old-refresh-token",
    expiresAt: Date.now() - 1000,
    scope: ["moderator:read:followers"],
  })
);

global.fetch = async (url, opts) => {
  const u = url.toString();
  if (u.includes("id.twitch.tv/oauth2/token")) {
    const body = new URLSearchParams(opts.body);
    assert.equal(body.get("grant_type"), "refresh_token");
    assert.equal(body.get("refresh_token"), "old-refresh-token");
    return new Response(
      JSON.stringify({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 14400,
        scope: ["moderator:read:followers", "channel:read:subscriptions", "bits:read"],
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
  if (u.includes("api.twitch.tv/helix/users")) {
    assert.equal(opts.headers.Authorization, "Bearer new-access-token");
    return new Response(JSON.stringify({ data: [{ id: "999", login: "johnstream" }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  throw new Error("Unexpected fetch: " + u);
};

const { ensureAuthenticated } = await import("../src/twitchAuth.js");

const tokens = await ensureAuthenticated({
  clientId: "client",
  clientSecret: "secret",
  redirectUri: "http://localhost:3939/auth/callback",
  port: 3939,
});

assert.equal(tokens.accessToken, "new-access-token");
assert.equal(tokens.userId, "999");
assert.equal(tokens.login, "johnstream");

const onDisk = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));
assert.equal(onDisk.accessToken, "new-access-token");
assert.equal(onDisk.refreshToken, "new-refresh-token");

fs.unlinkSync(TOKENS_PATH);
console.log("PASS: refresh flow updates tokens.json and skips the browser login when a refresh token exists");
