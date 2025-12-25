import { useEffect } from 'react';

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  description: string;
  url: string;
  logo?: string;
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}

interface LocalBusinessSchema {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  description: string;
  address: {
    "@type": "PostalAddress";
    addressCountry: string;
    addressRegion?: string;
    addressLocality?: string;
  };
  telephone?: string;
  email?: string;
  url: string;
  priceRange?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

interface StructuredDataProps {
  type: 'organization' | 'localbusiness';
  data: OrganizationSchema | LocalBusinessSchema;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = `structured-data-${type}`;
    
    // Remove existing script if present
    const existing = document.getElementById(`structured-data-${type}`);
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById(`structured-data-${type}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);
  
  return null;
}

// Helper function to generate Organization schema for SmartPro
export function getSmartProOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SmartPro",
    description: "National digital infrastructure connecting SMEs with certified Sanad offices across Oman. Access 3,000+ document templates and complete business services faster, cheaper, and smarter.",
    url: typeof window !== 'undefined' ? window.location.origin : '',
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
    },
  };
}

// Helper function to generate LocalBusiness schema for Sanad offices
export function getSanadOfficeSchema(office: {
  officeName: string;
  description: string;
  governorate: string;
  wilayat: string;
  phone?: string;
  email?: string;
  slug: string;
  averageRating?: number;
  reviewCount?: number;
}): LocalBusinessSchema {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: office.officeName,
    description: office.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "OM",
      addressRegion: office.governorate,
      addressLocality: office.wilayat,
    },
    telephone: office.phone,
    email: office.email,
    url: `${baseUrl}/offices/${office.slug}`,
    priceRange: "$$",
    ...(office.averageRating && office.reviewCount ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: office.averageRating,
        reviewCount: office.reviewCount,
      }
    } : {}),
  };
}
