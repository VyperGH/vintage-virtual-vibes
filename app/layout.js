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
              <h1 className="text-2xl font-bold text-vvv-gold">VVV</h1>
              <div className="space-x-6">
                <a href="#home" className="text-vvv-gold hover:text-white transition">Home</a>
                <a href="#streamers" className="text-vvv-gold hover:text-white transition">Streamers</a>
                <a href="#clips" className="text-vvv-gold hover:text-white transition">Clips</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}