import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
    const siteName = "Sarker Shop";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDesc = "Your ultimate destination for premium products. Shop the best deals at Sarker Shop.";
    const metaDesc = description || defaultDesc;
    const metaImage = image || "https://sarker.shop/static/images/logo.png"; // Fallback to a default logo or cover image

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDesc} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || "https://sarker.shop/"} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url || "https://sarker.shop/"} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={metaImage} />

            {/* Canonical URL to prevent duplicate content issues */}
            {url && <link rel="canonical" href={url} />}
        </Helmet>
    );
};

export default SEO;
