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
              <h1 className="text-2xl font-bold text-white">VVV</h1>
              <div className="flex items-center space-x-6">
                <a href="#home" className="text-purple-200 hover:text-white transition">Home</a>
                <a href="#streamers" className="text-purple-200 hover:text-white transition">Streamers</a>
                <a href="#clips" className="text-purple-200 hover:text-white transition">Clips</a>
                <a 
                  href="https://discord.gg/yVVACSrKuK" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Join Our Discord
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}