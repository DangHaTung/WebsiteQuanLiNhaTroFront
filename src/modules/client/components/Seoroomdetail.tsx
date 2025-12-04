import React from "react";

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
  latitude?: number;
  longitude?: number;
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
  latitude = 0,
  longitude = 0,
}: VSeoRoomDetailProps) {
  // structured data chi tiết
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: title,
    description,
    image,
    address: {
      "@type": "PostalAddress",
      streetAddress: address || "Không xác định",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
        }
      : undefined,
    amenityFeature: amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    additionalProperty: area
      ? [
          {
            "@type": "PropertyValue",
            name: "Diện tích",
            value: area,
          },
        ]
      : undefined,
  };

  return (
    <>
      {/* BASIC SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`phong tro, nha tro, ${title}, cho thue phong`} />
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
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </>
  );
}
