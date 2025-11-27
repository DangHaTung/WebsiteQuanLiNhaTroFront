import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO = ({ title, description, keywords }: SEOProps) => {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Meta description
    if (description) {
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement("meta");
        descTag.setAttribute("name", "description");
        document.head.appendChild(descTag);
      }
      descTag.setAttribute("content", description);
    }

    // Meta keywords
    if (keywords) {
      let keyTag = document.querySelector('meta[name="keywords"]');
      if (!keyTag) {
        keyTag = document.createElement("meta");
        keyTag.setAttribute("name", "keywords");
        document.head.appendChild(keyTag);
      }
      keyTag.setAttribute("content", keywords);
    }
  }, [title, description, keywords]);

  return null;
};

export default SEO;
