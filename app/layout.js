import './globals.css'

export const metadata = {
  title: 'Vintage Virtual Vibes',
  description: 'Gaming community showcase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-black bg-opacity-50 backdrop-blur-sm fixed w-full z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="relative group">
                <a 
                  href="https://discord.gg/yVVACSrKuK" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Join Our Discord
                </a>
                {/* Discord Widget Dropdown */}
                <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <iframe
                    src="https://discord.com/widget?id=1346901878075555903&theme=dark"
                    width="350"
                    height="500"
                    allowTransparency={true}
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  ></iframe>
                </div>
              </div>
              <div className="space-x-6">
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