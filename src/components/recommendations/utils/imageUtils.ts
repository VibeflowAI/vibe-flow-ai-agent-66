
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

// Check if two recommendations are effectively duplicates
export const areDuplicateRecommendations = (rec1: any, rec2: any): boolean => {
  if (!rec1 || !rec2) return false;
  
  // Check ID first
  if (rec1.id === rec2.id) return true;
  
  // Then check if titles are very similar (case-insensitive)
  const title1 = rec1.title.toLowerCase().trim();
  const title2 = rec2.title.toLowerCase().trim();
  
  // If titles are identical or very similar, it's likely a duplicate
  if (title1 === title2) return true;
  
  // Calculate similarity (basic approach)
  // If the titles are at least 80% similar, consider them duplicates
  const longerTitle = title1.length > title2.length ? title1 : title2;
  const shorterTitle = title1.length > title2.length ? title2 : title1;
  
  if (shorterTitle.length === 0) return false;
  
  // If the longer title includes the shorter title, and the length difference is small
  if (longerTitle.includes(shorterTitle) && 
      (longerTitle.length - shorterTitle.length) / longerTitle.length < 0.2) {
    return true;
  }
  
  return false;
};
