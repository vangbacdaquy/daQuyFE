"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    }
  };

  return (
    <>
      <motion.div
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          "flex flex-col items-center justify-center p-8 sm:p-12 text-center",
          disabled 
            ? "border-gray-600 bg-gray-800/20 cursor-not-allowed opacity-60" 
            : isDragging 
              ? "border-sea-gold bg-sea-gold/10 scale-[1.02] shadow-xl" 
              : "border-sea-sub-blue bg-sea-blue/40 hover:border-sea-gold/50 hover:bg-sea-blue/60 cursor-pointer"
        )}
      >
        <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={cn(
                "p-4 rounded-full transition-colors duration-300",
                isDragging ? "bg-sea-gold text-sea-blue" : "bg-sea-sub-blue text-sea-gold group-hover:bg-sea-gold group-hover:text-sea-blue"
            )}>
                <UploadCloud size={32} />
            </div>
            
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                   Upload Photos
                </h3>
                <p className="text-sm text-sea-light-gray">
                   Tap to select or drag files here
                </p>
            </div>

            <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white/5 text-sea-gray border border-white/5">
                    <Camera size={12} /> Camera
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white/5 text-sea-gray border border-white/5">
                    <ImageIcon size={12} /> Gallery
                </span>
            </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sea-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />
    </>
  );
}
