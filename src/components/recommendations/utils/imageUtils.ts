
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
export const createUniqueIdFromRecommendation = (rec: {id: string, title: string}): string => {
  // Use both ID and title to ensure uniqueness in case of data inconsistencies
  return `${rec.id}-${rec.title.replace(/\s+/g, '-').toLowerCase()}`;
};
