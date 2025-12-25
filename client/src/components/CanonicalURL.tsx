import { useEffect } from 'react';

interface CanonicalURLProps {
  path?: string;
}

export function CanonicalURL({ path }: CanonicalURLProps) {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const canonicalPath = path || window.location.pathname;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    
    // Remove existing canonical link if present
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.remove();
    }
    
    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    
    return () => {
      const linkToRemove = document.querySelector('link[rel="canonical"]');
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [path]);
  
  return null;
}
