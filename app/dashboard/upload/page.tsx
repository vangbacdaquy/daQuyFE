"use client";

import { ImageUploader } from "../ImageUploader";

export default function UploadPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-sea-sub-blue rounded-lg shadow-xl p-6 border border-sea-gold/20">
        <h2 className="text-2xl font-bold text-sea-gold mb-6">Upload Jewelry Image</h2>
        <ImageUploader />
      </div>
    </div>
  );
}
