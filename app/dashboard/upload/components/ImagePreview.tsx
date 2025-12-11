"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-sea-light-gray">
          Selected Images
        </h3>
        <span className="text-xs bg-sea-sub-blue px-2 py-1 rounded-full text-sea-gold">
          {previews.length}
        </span>
      </div>
      
      <motion.div 
        layout
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {previews.map((preview, index) => (
            <motion.div
              layout
              key={preview} // Using preview URL as key assuming unique enough for this session
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-sm">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Upload Overlay */}
                {uploading && uploadProgress[selectedImages[index].name] !== undefined && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-2">
                    <Loader2 className="w-8 h-8 text-sea-gold animate-spin mb-2" />
                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-sea-gold h-full transition-all duration-300"
                            style={{ width: `${uploadProgress[selectedImages[index].name]}%` }}
                        />
                    </div>
                  </div>
                )}
                
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>

              {/* Remove Button - Always visible on mobile, nicer on desktop */}
              {!uploading && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 active:scale-90 transition-all z-20"
                  type="button"
                  aria-label="Remove image"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
