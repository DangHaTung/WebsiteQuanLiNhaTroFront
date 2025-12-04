// ================= FIX JSX ERROR =================
declare namespace JSX {
  interface Element {}
  interface ElementClass {}
  interface ElementAttributesProperty { props: {} }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}



const SeoContact = () => {
  return (
    <>
      {/* TITLE + DESCRIPTION */}
      <title>Liên hệ | Quản Lý Nhà Trọ — Hỗ trợ & Kết nối</title>

      <meta
        name="description"
        content="Liên hệ Quản Lý Nhà Trọ để được hỗ trợ về phòng trọ, hợp đồng, hóa đơn, hoặc hợp tác chủ trọ. Hotline: +84 912 345 678 — Email: support@minhttph52652.id.vn."
      />

      <meta
        name="keywords"
        content="lien he, quan ly nha tro, ho tro phong tro, support nha tro, thong tin lien he, contact"
      />

      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://minhttph52652.id.vn/contact" />

      {/* OPEN GRAPH */}
      <meta property="og:title" content="Liên hệ | Quản Lý Nhà Trọ" />
      <meta
        property="og:description"
        content="Hỗ trợ khách thuê & chủ trọ. Gọi hotline hoặc gửi email để được hỗ trợ nhanh nhất."
      />
      <meta
        property="og:image"
        content="https://minhttph52652.id.vn/og-contact.jpg"
      />
      <meta property="og:url" content="https://minhttph52652.id.vn/contact" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="vi_VN" />

      {/* TWITTER CARD */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Liên hệ | Quản Lý Nhà Trọ" />
      <meta
        name="twitter:description"
        content="Hỗ trợ khách thuê, chủ trọ, hợp tác & phản ánh dịch vụ."
      />
      <meta
        name="twitter:image"
        content="https://minhttph52652.id.vn/og-contact.jpg"
      />

      {/* CONTACT SCHEMA JSON-LD */}
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Liên hệ Quản Lý Nhà Trọ",
          "url": "https://minhttph52652.id.vn/contact",
          "about": "Trang liên hệ hỗ trợ khách thuê và chủ trọ.",
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+84 912 345 678",
              "contactType": "customer support",
              "areaServed": "VN",
              "availableLanguage": ["Vietnamese", "English"]
            }
          ],
          "publisher": {
            "@type": "Organization",
            "name": "Quản Lý Nhà Trọ",
            "logo": "https://minhttph52652.id.vn/logo.png"
          }
        }
        `}
      </script>

      {/* UI DEMO – Hiển thị đẹp */}
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "12px" }}>
          Liên hệ Quản Lý Nhà Trọ
        </h1>

        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Nếu bạn cần hỗ trợ về phòng trọ, hợp đồng, hóa đơn hoặc vấn đề khác,
          hãy liên hệ với chúng tôi qua các thông tin sau:
        </p>

        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#f5f8ff",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <p><strong>📞 Hotline:</strong> +84 912 345 678</p>
          <p><strong>📧 Email:</strong> support@minhttph52652.id.vn</p>
          <p><strong>⏰ Giờ làm việc:</strong> 08:00 – 18:00 (Thứ 2 – Thứ 6)</p>
          <p><strong>📍 Địa chỉ:</strong> Hà Nội, Việt Nam</p>
        </div>

        <h2 style={{ marginTop: "20px", fontWeight: "bold" }}>
          Gửi yêu cầu hỗ trợ
        </h2>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Họ và tên"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <textarea
            placeholder="Nội dung cần hỗ trợ..."
            rows={4}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          ></textarea>
          <button
            style={{
              padding: "12px",
              background: "#4A6CF7",
              color: "white",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </>
  );
};

export default SeoContact;
