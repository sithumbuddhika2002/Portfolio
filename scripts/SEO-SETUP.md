# Google Search setup

The preferred homepage is https://portfolio-flax-ten-t6cfoa5253.vercel.app/.
The HTML includes descriptive metadata, a canonical URL, social previews, and
Person/WebSite structured data. Vite copies robots.txt and sitemap.xml into dist.
Vercel sends noindex headers on admin and standalone lamp pages. Keep those URLs
crawlable so search engines can read their noindex headers.

## After deploying

1. Verify that the public homepage opens without a Vercel login, and that
   /robots.txt and /sitemap.xml return the actual files rather than the app HTML.
2. Open https://search.google.com/search-console and add a URL-prefix property
   for the exact preferred homepage URL above.
3. Verify ownership. If using the HTML-tag method, copy Google's supplied
   google-site-verification meta tag into index.html's head, deploy, then verify.
   Never invent a verification token.
4. Submit sitemap.xml in Search Console's Sitemaps screen.
5. Inspect the homepage URL, use Test Live URL, check the rendered page contains
   your full name and real portfolio content, then select Request Indexing.
6. Link this homepage from your GitHub profile and LinkedIn profile using your
   consistent name, Sithum Buddhika.

The portfolio still loads its content with JavaScript and Firebase. If Google's
rendered-page test cannot see the portfolio, investigate data loading and consider
prerendering the public content. Metadata alone does not resolve rendering issues.

If the preferred domain changes, update index.html (canonical, og:url, JSON-LD),
public/robots.txt, and public/sitemap.xml together, then redirect the old domain.

Crawling may take days or weeks; indexing and a first-place ranking are not
guaranteed. Monitor indexing and queries in Search Console.

Google's guide: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
