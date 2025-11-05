import { useState } from 'react';
import { Lightbox } from './lightbox';

interface ImageWithLightboxProps {
  src: string;
  alt: string;
  className?: string;
  images?: string[];
}

export const ImageWithLightbox = ({ 
  src, 
  alt, 
  className = '', 
  images 
}: ImageWithLightboxProps) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const allImages = images || [src];
  const initialIndex = images ? images.indexOf(src) : 0;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer transition-transform hover:scale-105 ${className}`}
        onClick={() => setShowLightbox(true)}
        loading="lazy"
      />
      
      {showLightbox && (
        <Lightbox
          images={allImages}
          initialIndex={initialIndex >= 0 ? initialIndex : 0}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
};
