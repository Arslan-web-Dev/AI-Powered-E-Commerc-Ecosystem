export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata(props: SEOProps, defaultTitle: string = 'NexusAI Commerce') {
  const {
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    canonical,
    noindex = false,
    nofollow = false,
  } = props;

  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const fullDescription = description || 'Shop smarter with AI-powered recommendations, intelligent search, and personalized experiences at NexusAI Commerce.';
  const fullKeywords = keywords || 'AI e-commerce, smart shopping, product recommendations, online store';

  const metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      type: ogType,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: defaultTitle,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    ...(canonical && { canonical }),
  };

  return metadata;
}

export function generateProductSEO(product: {
  name: string;
  description?: string;
  price: string;
  category?: string;
  image?: string;
}) {
  const title = product.name;
  const description = product.description || `Buy ${product.name} at NexusAI Commerce. ${product.category ? `Part of our ${product.category} collection.` : ''} Price: $${product.price}`;
  const keywords = [product.name, product.category, 'buy online', 'best price', 'NexusAI Commerce'].filter(Boolean).join(', ');

  return generateMetadata({
    title,
    description,
    keywords,
    ogImage: product.image,
    ogType: 'product',
  });
}

export function generateCategorySEO(category: {
  name: string;
  description?: string;
  image?: string;
}) {
  const title = `${category.name} - NexusAI Commerce`;
  const description = category.description || `Browse our ${category.name} collection. Find the best products with AI-powered recommendations.`;
  const keywords = [category.name, 'shop', 'buy online', 'NexusAI Commerce'].join(', ');

  return generateMetadata({
    title,
    description,
    keywords,
    ogImage: category.image,
  });
}
