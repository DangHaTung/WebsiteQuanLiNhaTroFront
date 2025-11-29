import React from "react";

/**
 * ⭐ VSEO ROOM DETAIL — VERSION ĐƠN GIẢN KHÔNG LIÊN QUAN ROUTER
 * Không dùng useParams, không dùng react-router-dom,
 * Chỉ nhận props vào → gắn SEO an toàn, không lỗi dự án.
 */

interface VSeoRoomDetailProps {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
}

export default function VSeoRoomDetail({
  title,
  description,
  image = "/seo-default.jpg",
  canonical = typeof window !== "undefined" ? window.location.href : "https://example.com",
}: VSeoRoomDetailProps) {
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
    </>
  );
}