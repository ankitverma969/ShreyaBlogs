import { useEffect } from 'react';

const site = {
  name: 'Shreya Writes',
  url: import.meta.env.VITE_SITE_URL || 'https://shreyawrites.com',
  image: '/icons/icon-512.svg'
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes.seed || {}).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }

  Object.entries(attributes.values).forEach(([key, value]) => element.setAttribute(key, value));
}

function SEO({ title, description, image = site.image, type = 'website', article, language = 'mixed' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Poetry, Shayari, Stories`;
    const canonical = `${site.url}${window.location.pathname}`;

    document.title = fullTitle;
    document.documentElement.lang = language === 'english' ? 'en' : language === 'hindi' ? 'hi' : 'hi-IN';
    setMeta('meta[name="description"]', {
      seed: { name: 'description' },
      values: { content: description }
    });
    setMeta('meta[name="keywords"]', {
      seed: { name: 'keywords' },
      values: {
        content:
          'Hindi poetry, हिन्दी शायरी, Devanagari poetry, shayari, stories, sher, handwritten writing, Shreya Writes'
      }
    });
    setMeta('meta[name="language"]', {
      seed: { name: 'language' },
      values: { content: language === 'english' ? 'English' : language === 'hindi' ? 'Hindi' : 'Hindi, English' }
    });
    setMeta('meta[property="og:locale"]', {
      seed: { property: 'og:locale' },
      values: { content: language === 'english' ? 'en_US' : 'hi_IN' }
    });
    setMeta('meta[property="og:title"]', { seed: { property: 'og:title' }, values: { content: fullTitle } });
    setMeta('meta[property="og:description"]', {
      seed: { property: 'og:description' },
      values: { content: description }
    });
    setMeta('meta[property="og:type"]', { seed: { property: 'og:type' }, values: { content: type } });
    setMeta('meta[property="og:url"]', { seed: { property: 'og:url' }, values: { content: canonical } });
    setMeta('meta[property="og:image"]', { seed: { property: 'og:image' }, values: { content: `${site.url}${image}` } });
    setMeta('meta[name="twitter:card"]', { seed: { name: 'twitter:card' }, values: { content: 'summary_large_image' } });

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    let jsonLd = document.getElementById('structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'structured-data';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }

    jsonLd.textContent = JSON.stringify(
      article || {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: site.url
      }
    );
  }, [article, description, image, language, title, type]);

  return null;
}

export default SEO;
