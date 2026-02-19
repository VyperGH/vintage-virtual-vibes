export async function GET() {
  const streamers = [
    { name: 'Vyper', channel: 'ecsvyper' },
    { name: 'Distrought', channel: 'distrought' },
    { name: 'Arc193', channel: 'thearc193' }
  ];

  try {
    // Check live status for all Twitch streamers
    const liveStatuses = await Promise.all(
      streamers.map(async (streamer) => {
        try {
          const response = await fetch(
            `https://decapi.me/twitch/uptime/${streamer.channel}`,
            { cache: 'no-store' }
          );
          const text = await response.text();
          const isLive = !text.includes('offline') && !text.includes('error');
          
          return { 
            name: streamer.name, 
            channel: streamer.channel,
            isLive 
          };
        } catch {
          return { 
            name: streamer.name, 
            channel: streamer.channel,
            isLive: false 
          };
        }
      })
    );

    // Check if main channel is live
    const mainResponse = await fetch(
      `https://decapi.me/twitch/uptime/vintagevirtualvibes`,
      { cache: 'no-store' }
    );
    const mainText = await mainResponse.text();
    const mainIsLive = !mainText.includes('offline') && !mainText.includes('error');

    return Response.json({ 
      mainChannel: { isLive: mainIsLive },
      streamers: liveStatuses 
    });
  } catch (error) {
    return Response.json({ 
      mainChannel: { isLive: false },
      streamers: [],
      error: error.message 
    });
  }
}