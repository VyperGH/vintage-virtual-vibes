'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const streamers = [
    {
      name: "Vyper",
      style: "Chill & Goofy Gamer",
      description: "Relaxed gaming vibes with a goofy twist - unless it's a horror game, then all bets are off!",
      streamLink: "https://twitch.tv/ecsvyper",
      image: "/vyper.jpg",
      twitchChannel: "ecsvyper"
    },
    {
      name: "Distrought", 
      style: "Chaotic Entertainer",
      description: "A loud, fast-talking wildcard who turns panic into punchlines.",
      streamLink: "https://twitch.tv/distrought",
      image: "/distrought.png",
      twitchChannel: "distrought"
    },
    {
      name: "Bones",
      style: "The Co-Op mastermind",
      description: "We survive together… or don't. Either way, it's entertaining.",
      streamLink: "https://www.youtube.com/@rntgaming5828",
      image: "/tony.png",
      twitchChannel: null
    },
    {
      name: "Arc193",
      style: "The Tactical All-Rounder",
      description: "A versatile player for any genre. I'm here for the win, the team, and non-stop action",
      streamLink: "https://twitch.tv/thearc193",
      image: "/justin.png",
      twitchChannel: "thearc193"
    }
  ]
  
  const [streamerLiveStatus, setStreamerLiveStatus] = useState({});

  useEffect(() => {
    const checkStreamerStatus = async () => {
      try {
        const response = await fetch('/api/twitch');
        const data = await response.json();
        
        // Create a map of streamer names to live status
        const statusMap = {};
        if (data.streamers) {
          data.streamers.forEach(streamer => {
            statusMap[streamer.name] = streamer.isLive;
          });
        }
        setStreamerLiveStatus(statusMap);
      } catch (error) {
        console.error('Error checking streamer status:', error);
      }
    };

    checkStreamerStatus();
    const interval = setInterval(checkStreamerStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-900">
      {/* Hero Section */}
      <div id="home" className="container mx-auto px-4 py-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-amber-400 mb-4">
            Vintage Virtual Vibes
          </h1>
          <p className="text-xl text-amber-400 mb-20">
            Four gamers, one community, endless entertainment
          </p>
          <div className="flex justify-center">
            <img 
              src="/newvintagelogo.png" 
              alt="Vintage Virtual Vibes retro gaming community logo with vaporwave aesthetic"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Our Socials Section */}
      <div id="socials" className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-8">Our Socials</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {/* Twitch */}
          <a 
            href="https://www.twitch.tv/vintagevirtualvibes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/twitchlogo.png" alt="Twitch streaming platform logo" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">Twitch</span>
          </a>

          {/* YouTube */}
          <a 
            href="https://www.youtube.com/@Vintage_Virtual_Vibes-f1n" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/youtubelogo.png" alt="YouTube video platform logo" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">YouTube</span>
          </a>

          {/* TikTok */}
          <a 
            href="https://www.tiktok.com/@vintagevirtualvib" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/tiktoklogo.png" alt="TikTok social media platform logo" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">TikTok</span>
          </a>

          {/* Gmail */}
          <a 
            href="mailto:VintageVirtualVibes@gmail.com" 
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/gmaillogo.png" alt="Gmail email contact icon" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">Email Us</span>
          </a>
        </div>
      </div>

      {/* Streamers Section */}
      <div id="streamers" className="container mx-auto px-4 py-0">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-12">Meet Our Streamers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {streamers.map((streamer, index) => (
            <div key={index} className="relative bg-gradient-to-b from-purple-900 via-purple-800 to-black bg-opacity-90 rounded-lg p-6 hover:bg-opacity-100 hover:scale-105 transition-transform">
              {/* Live Indicator - Top Right Corner */}
              {streamer.twitchChannel && streamerLiveStatus[streamer.name] && (
                <div className="absolute top-4 right-4 z-10">
                  
                    <a href={streamer.streamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 animate-pulse"
                  >
                    <span>🔴</span>
                    <span>LIVE</span>
                  </a>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <img 
                  src={streamer.image} 
                  alt={streamer.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{streamer.name}</h3>
                  <p className="text-orange-300 font-semibold mb-3">{streamer.style}</p>
                </div>
              </div>
              <p className="text-gray-200 mb-4 mt-4">{streamer.description}</p>
              <a href={streamer.streamLink} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-orange-300 transition">
                Watch Stream →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div id="videos" className="container mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-12">Latest Videos</h2>
        <LatestVideos />
      </div>

      {/* Our Friends Section */}
      <div id="friends" className="container mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-12">Our Friends</h2>
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-8 max-w-md">
            <div className="flex justify-center mb-6">
              <img 
                src="/commoners-logo.png" 
                alt="Commoners of DnD podcast logo - D&D gaming community"
                className="w-32 h-32 object-contain"
              />
            </div>
            <h3 className="text-3xl font-bold text-white text-center mb-6">Commoners of DnD</h3>
            <p className="text-gray-200 text-center mb-6">
              Check out our friends The Commoners of DnD!
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="https://www.twitch.tv/commonersofdnd"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Twitch
              </a>
              <a 
                href="https://www.youtube.com/@thecommonersofdnd"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                YouTube
              </a>
              <a 
                href="https://commoners.podbean.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Podcast
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LatestVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/youtube');
        const data = await response.json();
        if (data.videos) {
          setVideos(data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-amber-400">
        <p>Loading latest videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-300">
        <p>No videos available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {videos.map((video) => (
        <div key={video.id} className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
          <a 
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-auto hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2 line-clamp-2">{video.title}</h3>
          </a>
        </div>
      ))}
    </div>
  );
}