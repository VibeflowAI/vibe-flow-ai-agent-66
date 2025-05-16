
// Get a placeholder image URL based on the recommendation category
export const getCategoryPlaceholder = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'food':
      return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&h=400';
    case 'activity':
      return 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?auto=format&fit=crop&w=600&h=400';
    case 'mindfulness':
      return 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&h=400';
    default:
      return '/placeholder.svg';
  }
};

// Create a unique ID from a recommendation object to help with deduplication
export const createUniqueIdFromRecommendation = (rec: {id: string, title: string, category?: string}): string => {
  // Use ID, title, and category (if available) to create a more robust unique identifier
  const categoryPart = rec.category ? `-${rec.category.toLowerCase()}` : '';
  return `${rec.id}-${rec.title.replace(/\s+/g, '-').toLowerCase()}${categoryPart}`;
};

// Check if two recommendations are effectively duplicates - enhanced version
export const areDuplicateRecommendations = (rec1: any, rec2: any): boolean => {
  if (!rec1 || !rec2) return false;
  
  // Check ID first - exact match is a definite duplicate
  if (rec1.id === rec2.id) return true;
  
  // Then check if titles are very similar (case-insensitive, whitespace-normalized)
  const title1 = rec1.title.toLowerCase().trim();
  const title2 = rec2.title.toLowerCase().trim();
  
  // If titles are identical, it's a duplicate
  if (title1 === title2) return true;
  
  // More stringent similarity check
  // Calculate a simple Levenshtein-like similarity score
  const longerTitle = title1.length > title2.length ? title1 : title2;
  const shorterTitle = title1.length > title2.length ? title2 : title1;
  
  if (shorterTitle.length === 0) return false;
  
  // If the longer title includes the shorter title, do a more careful comparison
  if (longerTitle.includes(shorterTitle)) {
    // If they're very close in length, they're likely the same thing with slight differences
    const lengthRatio = shorterTitle.length / longerTitle.length;
    if (lengthRatio > 0.8) {
      return true;
    }
  }
  
  // Calculate word similarity
  const words1 = title1.split(/\s+/);
  const words2 = title2.split(/\s+/);
  
  // If both have at least 2 words and 80% of the words match, consider them duplicates
  if (words1.length >= 2 && words2.length >= 2) {
    const commonWords = words1.filter(w => words2.includes(w));
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    
    if (commonWords.length / totalUniqueWords > 0.7) {
      return true;
    }
  }
  
  return false;
};

// New function to normalize strings for comparison
export const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

// New: Generate a completely unique key for a recommendation
export const getRecommendationFingerprint = (rec: any): string => {
  if (!rec) return '';
  
  // Combine multiple properties for a more unique identifier
  const titlePart = normalizeString(rec.title);
  const descriptionPart = rec.description ? normalizeString(rec.description).substring(0, 20) : '';
  const categoryPart = rec.category ? normalizeString(rec.category) : '';
  
  return `${titlePart}-${descriptionPart}-${categoryPart}`;
};
