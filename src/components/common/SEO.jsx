import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = "Ramazan Seven | Yapı Malzemeleri";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription = description || "Ramazan Seven - Kaliteli Yapı Malzemeleri ve İnşaat Çözümleri. En iyi fiyatlarla hırdavat, boya ve yapı malzemeleri.";
  const siteKeywords = keywords || "yapı malzemeleri, hırdavat, inşaat malzemeleri, boya, ramazan seven";
  const siteUrl = "https://ramazan-seven.web.app";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Standart Meta Etiketleri */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />

      {/* Open Graph (Facebook/WhatsApp için) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={fullUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;
