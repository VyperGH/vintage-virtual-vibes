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
      style: "Old School Gamer",
      description: "Bringing back the classics with retro games and diving into newer horror experiences.",
      streamLink: "https://twitch.tv/distrought",
      image: "/distrought.png"
    },
    {
      name: "Bones",
      style: "Laid Back Player",
      description: "Gaming for pure relaxation and downtime - the ultimate chill zone.",
      streamLink: "https://www.youtube.com/@rntgaming5828",
      image: "/tony.png"
    },
    {
      name: "Arc193",
      style: "MMO Enthusiast",
      description: "Goofy gameplay across all genres, but MMOs are where the magic happens.",
      streamLink: "https://twitch.tv/thearc193",
      image: "/justin.png"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-900">
      {/* Hero Section */}
      <div id="home" className="container mx-auto px-4 py-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-vvv-gold mb-4">
            Vintage Virtual Vibes
          </h1>
          <p className="text-xl text-vvv-gold mb-12">
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

      {/* Streamers Section */}
      <div id="streamers" className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-vvv-gold text-center mb-12">Meet Our Streamers</h2>
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
                  <h3 className="text-2xl font-bold text-vvv-gold mb-2">{streamer.name}</h3>
                  <p className="text-orange-300 font-semibold mb-3">{streamer.style}</p>
                </div>
              </div>
              <p className="text-gray-200 mb-4 mt-4">{streamer.description}</p>
              <a href={streamer.streamLink} target="_blank" rel="noopener noreferrer" className="text-vvv-gold hover:text-orange-300 transition">
                Watch Stream →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Clips Section */}
      <div id="clips" className="container mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-vvv-gold text-center mb-12">Best Clips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Clip 1 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-vvv-gold">Clip 1 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-vvv-gold mb-2">Epic Moment #1</h3>
            <p className="text-gray-300 text-sm">Add your first clip here</p>
          </div>

          {/* Clip 2 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-vvv-gold">Clip 2 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-vvv-gold mb-2">Epic Moment #2</h3>
            <p className="text-gray-300 text-sm">Add your second clip here</p>
          </div>

          {/* Clip 3 - Placeholder */}
          <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-lg p-6">
            <div className="bg-purple-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
              <p className="text-vvv-gold">Clip 3 - Coming Soon</p>
            </div>
            <h3 className="text-xl font-bold text-vvv-gold mb-2">Epic Moment #3</h3>
            <p className="text-gray-300 text-sm">Add your third clip here</p>
          </div>
        </div>
      </div>
    </div>
  )
}