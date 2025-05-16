
import React, { useState } from 'react';
import { Image, ImageOff } from 'lucide-react';

interface RecommendationImageProps {
  imageUrl: string;
  title: string;
  hasImageUrl: boolean;
  categoryPlaceholder: string;
}

export const RecommendationImage = ({ 
  imageUrl, 
  title, 
  hasImageUrl, 
  categoryPlaceholder 
}: RecommendationImageProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="h-36 overflow-hidden relative">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Image className="h-8 w-8 text-gray-400 animate-pulse" />
        </div>
      )}
      
      <img 
        src={imageUrl} 
        alt={title} 
        className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
          console.log('Image failed to load:', imageUrl);
        }}
      />
      
      {imageError && hasImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageOff className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};
