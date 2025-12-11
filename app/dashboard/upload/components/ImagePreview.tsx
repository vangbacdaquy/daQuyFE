"use client";
 
import Image from "next/image";
 
interface ImagePreviewProps {
  previews: string[];
  selectedImages: File[];
  uploadProgress: { [key: string]: number };
  uploading: boolean;
  onRemove: (index: number) => void;
}
 
export function ImagePreview({
  previews,
  selectedImages,
  uploadProgress,
  uploading,
  onRemove,
}: ImagePreviewProps) {
  if (previews.length === 0) return null;
 
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-sea-light-gray mb-3">
        Selected Images ({previews.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-sea-blue">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              {uploading && uploadProgress[selectedImages[index].name] !== undefined && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center flex-col z-10">
                  <div className="w-16 h-16 border-4 border-t-transparent border-sea-gold rounded-full animate-spin"></div>
                  <p className="text-white mt-2 font-semibold drop-shadow-md">
                    {uploadProgress[selectedImages[index].name]}%
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <p className="mt-1 text-xs text-sea-gray truncate">
              {selectedImages[index].name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
 
 