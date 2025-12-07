"use client";

import { logout } from "./actions";
import { useState, useRef } from "react";
import Image from "next/image";

export default function DashboardPage() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");

    // Validate files
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name} is not a valid image type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      // Replace with your actual backend API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedUrls(data.urls || []);
      setUploadProgress(100);

      // Clear selections after successful upload
      setTimeout(() => {
        previews.forEach((preview) => URL.revokeObjectURL(preview));
        setSelectedImages([]);
        setPreviews([]);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Image Upload
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-3 sm:px-4 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Upload Area */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Upload Images
          </h2>

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">
              PNG, JPG, GIF, WEBP up to 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Selected Images ({previews.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
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
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 truncate">
                      {selectedImages[index].name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedImages.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : `Upload ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}`}
              </button>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-zinc-600 dark:text-zinc-400">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Uploaded Images */}
        {uploadedUrls.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Uploaded Images
            </h2>
            <div className="space-y-2">
              {uploadedUrls.map((url, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <p className="text-sm text-green-700 dark:text-green-400 break-all">
                    {url}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
