import React from "react";

/**
 * ⭐ VSEO ROOM DETAIL — VERSION CHI TIẾT
 * Không dùng useParams, không dùng react-router-dom,
 * Nhận props chi tiết phòng → SEO đầy đủ, JSON-LD, Open Graph, Twitter.
 */

interface VSeoRoomDetailProps {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  price?: number;
  currency?: string;
  area?: string;
  amenities?: string[];
  address?: string;
}

export default function VSeoRoomDetail({
  title,
  description,
  image = "/seo-default.jpg",
  canonical = typeof window !== "undefined" ? window.location.href : "https://example.com",
  price,
  currency = "VND",
  area,
  amenities = [],
  address,
}: VSeoRoomDetailProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: title,
    description,
    image,
    address: address || "Không xác định",
    geo: {
      "@type": "GeoCoordinates",
      latitude: "0", // có thể bổ sung
      longitude: "0",
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: currency,
        }
      : undefined,
    amenityFeature: amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
    })),
  };

  return (
    <>
      {/* BASIC SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`phong tro, nha tro, ${title}`} />
      <link rel="canonical" href={canonical} />

      {/* OPEN GRAPH */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      {/* TWITTER */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}
