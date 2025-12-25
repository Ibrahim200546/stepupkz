import { useState, useEffect, useRef } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
}

export const ResponsiveImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-shoe.svg',
  loading = 'lazy',
}: ResponsiveImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallbackSrc);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-contain sm:object-cover max-w-full transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
