
import { Recommendation } from './types';

// Function to deduplicate recommendations
export const deduplicateRecommendations = (data: any[]): Recommendation[] => {
  if (!data || data.length === 0) return [];
  
  console.log(`MoodContext deduplication: Starting with ${data.length} recommendations`);
  
  // Use a Map for O(1) lookup and to preserve insertion order
  const uniqueMap = new Map();
  const seenIds = new Set<string>();
  const duplicates: string[] = [];
  
  // First pass - identify duplicates for logging
  data.forEach(rec => {
    if (seenIds.has(rec.id)) {
      duplicates.push(rec.id);
    } else {
      seenIds.add(rec.id);
    }
  });
  
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate IDs: ${duplicates.join(', ')}`);
  }
  
  // Second pass - use Map for better uniqueness guarantee
  data.forEach(rec => {
    // Create a composite key using id and title
    const uniqueKey = `${rec.id}-${rec.title.replace(/\s+/g, '-').toLowerCase()}`;
    
    if (!uniqueMap.has(uniqueKey)) {
      uniqueMap.set(uniqueKey, rec);
    }
  });
  
  // Convert to array and map to our app's format
  const deduplicated = Array.from(uniqueMap.values()).map(rec => ({
    id: rec.id,
    title: rec.title,
    description: rec.description,
    category: rec.category,
    moodTypes: rec.mood_types,
    energyLevels: rec.energy_levels,
    imageUrl: rec.image_url
  }));
  
  console.log(`MoodContext deduplication: Finished with ${deduplicated.length} unique recommendations (removed ${data.length - deduplicated.length} duplicates)`);
  
  return deduplicated;
};

// Constants for mood and energy descriptions
export const getMoodEmojis = (): Record<string, string> => ({
  happy: '😊',
  calm: '😌',
  tired: '😴',
  stressed: '😰',
  sad: '😞'
});

export const getMoodDescriptions = (): Record<string, string> => ({
  happy: 'You feel joyful, content, and optimistic about your day.',
  calm: 'You feel relaxed, at peace, and mentally clear.',
  tired: 'You feel physically or mentally fatigued and need rest.',
  stressed: 'You feel overwhelmed, tense, or anxious about demands.',
  sad: 'You feel down, low in spirits, or emotionally heavy.'
});

export const getEnergyDescriptions = (): Record<string, string> => ({
  low: 'You have minimal energy, feeling drained or exhausted.',
  medium: 'You have moderate energy, able to function but not at peak.',
  high: 'You have abundant energy, feeling vibrant and ready to go.'
});
