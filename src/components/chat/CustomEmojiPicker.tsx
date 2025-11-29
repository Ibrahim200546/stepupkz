import React from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface CustomEmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onClose: () => void;
}

export const CustomEmojiPicker: React.FC<CustomEmojiPickerProps> = ({ onEmojiClick, onClose }) => {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData);
    onClose();
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50">
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        width={320}
        height={400}
        searchPlaceholder="Поиск эмодзи..."
        previewConfig={{
          showPreview: false
        }}
      />
    </div>
  );
};
