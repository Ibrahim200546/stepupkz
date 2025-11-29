import React from 'react';

interface StickerPickerProps {
  onStickerClick: (stickerUrl: string) => void;
  onClose: () => void;
}

const stickers = [
  'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10c1de0fa69a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
];

export const StickerPicker: React.FC<StickerPickerProps> = ({ onStickerClick, onClose }) => {
  return (
    <div className="absolute bottom-full right-0 mb-2 bg-background border rounded-lg shadow-lg p-4 w-64 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Стикеры</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stickers.map((sticker, index) => (
          <button
            key={index}
            onClick={() => {
              onStickerClick(sticker);
              onClose();
            }}
            className="w-full aspect-square hover:scale-110 transition-transform"
          >
            <img
              src={sticker}
              alt={`Sticker ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
