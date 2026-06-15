# Sarker Shop SEO Implementation Guide

This guide outlines a comprehensive, step-by-step strategy to implement Search Engine Optimization (SEO) from scratch for the Sarker Shop project (React frontend + Django REST backend).

---

## 1. Dynamic Meta Tags (React Frontend)

React is a Single Page Application (SPA), which means the `head` metadata needs to be dynamically updated when the user navigates between pages (e.g., from the Home page to a Product page).

**Step 1:** Install React Helmet

```bash
npm install react-helmet-async
```

**Step 2:** Wrap your app in `HelmetProvider` (`main.jsx` / `App.jsx`):

```javascript
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```
**Step 3:** Create a Reusable `SEO` Component
Create `src/components/SEO.jsx` to inject meta tags easily on any page:

```javascript
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
    return (
        <Helmet>
            <title>{title} | Sarker Shop</title>
            <meta name="description" content={description} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
export default SEO;
```

**Step 4:** Use `SEO.jsx` on your `ProductDetails.jsx`:

```javascript
<SEO 
    title={product.name} 
    description={product.description.substring(0, 150)} 
    image={product.image} 
    url={`https://sarker.shop/product/${product.slug}`} 
/>
```

---

## 2. Pre-rendering for Social Media Crawlers (Crucial for React)

Bots from Facebook, Twitter, and iMessage do NOT execute JavaScript. If someone shares a `https://sarker.shop/product/iphone` link, the bot will only see the empty `<div id="root"></div>` from Vite, not the beautiful product title/image.

**Solution:** Use **Prerender.io** or a basic Nginx crawler interceptor.
When a bot (User-Agent matches Facebook, Twitter, Googlebot) hits your React app, Nginx should proxy the request to a pre-renderer that executes the JS and returns the raw HTML with the correct `<meta og:image>` tags.

---

## 3. Structured Data (JSON-LD)

Structured data helps Google understand that a page is a "Product" and allows them to show the price, rating, and stock status directly on the Google search results page (Rich Snippets).

**Implementation:** Add this inside `ProductDetails.jsx` inside the `<Helmet>` tag:

```javascript
const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
        "@type": "Brand",
        "name": product.brand?.name || "Sarker Shop"
    },
    "offers": {
        "@type": "Offer",
        "url": `https://sarker.shop/product/${product.slug}`,
        "priceCurrency": "BDT",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
};

<Helmet>
    <script type="application/ld+json">
        {JSON.stringify(structuredData)}
    </script>
</Helmet>
```

---

## 4. XML Sitemap & Robots.txt

Google needs to know which pages to crawl and which to ignore.

**Backend (Django):**
Generate a dynamic `sitemap.xml` using Django's built-in sitemap framework.

1. Add `'django.contrib.sitemaps'` to `INSTALLED_APPS`.
2. Create `sitemaps.py` in your products app exposing product URLs.
3. Expose the sitemap endpoint in `urls.py`.

Because your frontend is React on a different domain/port, you can create a CRON job or a Django View that outputs an XML file mapping to the `https://sarker.shop/` URLs, not the API URLs.

**React (Public Folder):**
Place a `robots.txt` in `frontend/public/robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /account/
Disallow: /checkout/
Disallow: /order-tracking/

Sitemap: https://sarker.shop/sitemap.xml
```

---

## 5. Performance & Core Web Vitals

Google ranks fast websites higher.

* **Image Optimization:** Ensure all product images uploaded via Django are converted to `WebP` and compressed. You can use the `Pillow` library in Django to compress images on upload (`save()` method override).
* **Lazy Loading:** Apply `loading="lazy"` to product images in grid lists (`ProductCard.jsx`).
* **Pagination vs Infinite Scroll:** For SEO, classic pagination (e.g., `?page=2`) is actually easier for Googlebot to index than infinite scroll, unless you explicitly push URLs to the browser history.

---

## 6. Canonical URLs

To prevent Google from penalizing you for duplicate content (e.g., `sarker.shop/product/123` vs `sarker.shop/product/123?color=red`), define a canonical URL.

Add this in your `<SEO>` component:

```javascript
<link rel="canonical" href={url} />
```

---

## Summary Checklist

- [ ] Implement `react-helmet-async`.
* [ ] Create and integrate the `<SEO>` component on Home, Category, and Product pages.
* [ ] Inject Product `JSON-LD` schemas on the Product Details page.
* [ ] Setup `robots.txt` in the React public folder.
* [ ] Generate a dynamic `sitemap.xml` listing all valid frontend product URLs.
* [ ] Setup Nginx bot-routing to serve pre-rendered HTML to social media crawlers.
* [ ] Implement `WebP` image compression on the Django backend.

