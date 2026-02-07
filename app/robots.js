export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://vintagevirtualvibes.com/sitemap.xml',
  }
}