import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

const SEOHead = ({ 
  title = "StepUp Shoes - Магазин стильной обуви",
  description = "Современный магазин стильной обуви, сочетающий комфорт и качество. Широкий выбор обуви для мужчин, женщин и детей от ведущих мировых брендов.",
  keywords = "обувь, магазин обуви, кроссовки, туфли, ботинки, StepUp, интертоп, обувь Казахстан",
  image = "/placeholder.svg",
  type = "website"
}: SEOHeadProps) => {
  const location = useLocation();
  const url = `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Add structured data for organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "StepUp Shoes",
      "description": description,
      "url": window.location.origin,
      "logo": `${window.location.origin}/placeholder.svg`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "И. 187а, Ілияс Жансүгіров көшесі",
        "addressLocality": "Талдықорған",
        "addressCountry": "KZ"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+7-776-267-59-57",
        "contactType": "customer service",
        "email": "tanirbergenibrahim44@gmail.com"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, type, url]);

  return null;
};

export default SEOHead;
