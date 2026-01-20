'use client'

import './globals.css'
import { useEffect, useState } from 'react'

export default function RootLayout({ children }) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Check live status every 60 seconds
    const checkLiveStatus = async () => {
      try {
        const response = await fetch('/api/twitch');
        const data = await response.json();
        setIsLive(data.isLive);
      } catch (error) {
        console.error('Error checking live status:', error);
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Vintage Virtual Vibes</title>
        <meta name="description" content="Gaming community showcase" />
      </head>
      <body>
        <nav className="bg-black bg-opacity-50 backdrop-blur-sm fixed w-full z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                {/* Discord Button - Link on mobile, hover widget on desktop */}
                <div className="relative group">
                  <a 
                    href="https://discord.gg/yVVACSrKuK" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold whitespace-nowrap"
                  >
                    Join Our Discord
                  </a>
                  {/* Discord Widget - Desktop only, shows on hover */}
                  <div className="hidden md:block absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <iframe
                      src="https://discord.com/widget?id=1346901878075555903&theme=dark"
                      width="350"
                      height="500"
                      allowtransparency="true"
                      frameBorder="0"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    ></iframe>
                  </div>
                </div>
      
                {/* Twitch Live Button - Opens stream on mobile, hover preview on desktop */}
                {isLive && (
                  <div className="relative group">
                    <a
                     href="https://www.twitch.tv/vintagevirtualvibes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold whitespace-nowrap flex items-center gap-2"
                     >
                     <span className="animate-pulse">{"🔴"}</span>
                      <span>Currently Streaming Live!</span>
                    </a>
                    {/* Twitch Embed - Desktop only, shows on hover */}
                    <div className="hidden md:block absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <iframe
                        src="https://player.twitch.tv/?channel=vintagevirtualvibes&parent=vintagevirtualvibes.com&parent=www.vintagevirtualvibes.com"
                        width="400"
                        height="300"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:space-x-6 md:gap-0">
                <a href="#home" className="text-purple-200 hover:text-white transition">Home</a>
                <a href="#socials" className="text-purple-200 hover:text-white transition">Socials</a>
                <a href="#streamers" className="text-purple-200 hover:text-white transition">Streamers</a>
                <a href="#clips" className="text-purple-200 hover:text-white transition">Clips</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}