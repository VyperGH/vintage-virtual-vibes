export async function GET() {
  const channelName = 'vintagevirtualvibes';

  try {
    // Use Twitch's public API endpoint (no auth needed)
    const response = await fetch(
      `https://decapi.me/twitch/uptime/${channelName}`,
      { cache: 'no-store' }
    );

    const text = await response.text();
    const isLive = !text.includes('offline') && !text.includes('error');

    return Response.json({ isLive });
  } catch (error) {
    return Response.json({ isLive: false, error: error.message });
  }
}