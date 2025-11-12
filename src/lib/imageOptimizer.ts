/**
 * Image optimization utility for client-side image processing
 * Resizes and converts images to WebP format for better performance
 */

export interface OptimizedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Optimize an image file by resizing and converting to WebP
 * @param file - The image file to optimize
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - WebP quality 0-1 (default: 0.85)
 * @returns Promise<OptimizedImage>
 */
export const optimizeImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<OptimizedImage> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      img.src = e.target.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (or fallback to JPEG if not supported)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'));
              return;
            }

            resolve({
              blob,
              url: URL.createObjectURL(blob),
              width,
              height,
              originalSize: file.size,
              optimizedSize: blob.size,
            });
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
};

/**
 * Generate a thumbnail from an image file
 * @param file - The image file
 * @param size - Thumbnail size (default: 200)
 * @returns Promise<OptimizedImage>
 */
export const generateThumbnail = async (
  file: File,
  size: number = 200
): Promise<OptimizedImage> => {
  return optimizeImage(file, size, size, 0.7);
};

/**
 * Check if file is a valid image
 * @param file - File to check
 * @returns boolean
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
