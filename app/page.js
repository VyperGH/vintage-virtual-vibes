export default function Home() {
  const streamers = [
    {
      name: "Vyper",
      style: "Chill & Goofy Gamer",
      description: "Relaxed gaming vibes with a goofy twist - unless it's a horror game, then all bets are off!",
      streamLink: "https://twitch.tv/ecsvyper",
      image: "/vyper.jpg"
    },
    {
      name: "Distrought", 
      style: "Chaotic Entertainer",
      description: "A loud, fast-talking wildcard who turns panic into punchlines.",
      streamLink: "https://twitch.tv/distrought",
      image: "/distrought.png"
    },
    {
      name: "Bones",
      style: "The Co-Op mastermind",
      description: "We survive together… or don’t. Either way, it’s entertaining.",
      streamLink: "https://www.youtube.com/@rntgaming5828",
      image: "/tony.png"
    },
    {
      name: "Arc193",
      style: "The Tactical All-Rounder",
      description: "A versatile player for any genre. I’m here for the win, the team, and non-stop action",
      streamLink: "https://twitch.tv/thearc193",
      image: "/justin.png"
    }
  ]

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
              src="/vibelogoblue.png" 
              alt="Vintage Virtual Vibes Logo"
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
            <img src="/twitchlogo.png" alt="Twitch" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">Twitch</span>
          </a>

          {/* YouTube */}
          <a 
            href="https://www.youtube.com/@Vintage_Virtual_Vibes-f1n" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/youtubelogo.png" alt="YouTube" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">YouTube</span>
          </a>
          {/* Kick */}
          <a 
            href="https://kick.com/vintagevirtualvibe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/kicklogo.jpg" alt="Kick" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">Kick</span>
          </a>


          {/* Gmail */}
          <a 
            href="mailto:VintageVirtualVibes@gmail.com" 
            className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <img src="/gmaillogo.png" alt="Gmail" className="w-16 h-16 object-contain" />
            <span className="text-white font-semibold text-lg">Email Us</span>
          </a>
        </div>
      </div>
      {/* Streamers Section */}
      <div id="streamers" className="container mx-auto px-4 py-0">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-12">Meet Our Streamers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {streamers.map((streamer, index) => (
            <div key={index} className="bg-gradient-to-b from-purple-900 via-purple-800 to-black bg-opacity-90 rounded-lg p-6 hover:bg-opacity-100 transition">
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

      {/* Clips Section */}
      <div id="clips" className="container mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-amber-400 text-center mb-12">Best Clips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Clip 1 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-amber-400">Clip 1 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Epic Moment #1</h3>
            <p className="text-gray-300 text-sm">Add your first clip here</p>
          </div>

          {/* Clip 2 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-amber-400">Clip 2 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Epic Moment #2</h3>
            <p className="text-gray-300 text-sm">Add your second clip here</p>
          </div>

          {/* Clip 3 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-amber-400">Clip 3 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">Epic Moment #3</h3>
            <p className="text-gray-300 text-sm">Add your third clip here</p>
          </div>
        </div>
      </div>
    </div>

        )
}