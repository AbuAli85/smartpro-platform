import { publicProcedure, router } from "../_core/trpc";
import { listSanadOffices } from "../db";

export const sitemapRouter = router({
  generate: publicProcedure.query(async () => {
    const result = await listSanadOffices({});
    const offices = result.offices;
    
    const baseUrl = process.env.VITE_APP_URL || 'https://smartpro.manus.space';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/offices', changefreq: 'daily', priority: '0.9' },
      { url: '/templates', changefreq: 'weekly', priority: '0.8' },
      { url: '/create-office', changefreq: 'monthly', priority: '0.7' },
    ];
    
    // Dynamic office pages
    const officePages = offices.map((office: any) => ({
      url: `/offices/${office.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    }));
    
    // Generate XML
    const urls = [...staticPages, ...officePages].map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    
    return { sitemap };
  }),
});
