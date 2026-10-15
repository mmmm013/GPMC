import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* A crawler following a Download link opened a real $1.99 Stripe checkout every time
         (found 2026-10-15). The song-download endpoints are for a listener's tap, never a crawl. */
      disallow: ['/api/'],
    },
    sitemap: 'https://www.gputnammusic.com/sitemap.xml',
  };
}
