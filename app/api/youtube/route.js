export async function GET() {
  const apiKey = 'AIzaSyA19UZSEQp2F1Hzffm4y0ow8GEuomnOZAA';
  const channelId = 'UCh7fXA3QDAr0T9vE8Nr1HvQ';

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3&type=video`,
      { cache: 'no-store' }
    );

    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message });
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt
    }));

    return Response.json({ videos });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}