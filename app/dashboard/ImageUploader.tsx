"use client";
 
import { useState, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image";
 
const storage = getStorage(app);
 
interface ProcessedItem {
  imageURL: string; // I'll add the URL here to link it to the image
  imageID: string;
  count: number;
  description: string;
}
 
export function ImageUploader() {
  const { user, getJwt } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");
 
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
    if (!user) {
      setError("You must be logged in to upload files.");
      return;
    }
 
    setUploading(true);
    setError("");
    setUploadProgress({});
 
    const uploadPromises = selectedImages.map((file) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;
 
      const fileId = uuidv4();
      const extension = file.name.split(".").pop() || "jpg";
      const storagePath = `${datePrefix}/${fileId}.${extension}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });
 
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(prev => ({...prev, [file.name]: progress}));
          },
          (err) => {
            console.error("Upload error:", err);
            setError(`Upload failed for ${file.name}.`);
            reject(err);
          },
          async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            } catch (downloadError) {
                console.error(downloadError);
                setError(`Failed to get download URL for ${file.name}.`);
                reject(downloadError);
            }
          }
        );
      });
    });
 
    try {
        const downloadURLs = await Promise.all(uploadPromises);
       
        const token = await getJwt();
        const response = await fetch("/api/process-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ file_uris: downloadURLs, prompt:"đếm và giải thích cho tôi có bao nhiêu món trang sức trong khay này" }),
        });
 
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Backend processing failed." }));
            throw new Error(errorData.message || `Backend processing failed.`);
        }
       
        const result = await response.json();
        console.log("Backend response:", result);
 
        // Assuming the order of items in response matches the order of downloadURLs
        const newProcessedItems: ProcessedItem[] = result.data.items.map((item: any, index: number) => ({
            ...item,
            imageURL: downloadURLs[index]
        }));
 
        setProcessedItems(prev => [...prev, ...newProcessedItems]);
 
        // Clear selections after successful upload and processing
        setTimeout(() => {
            previews.forEach((preview) => URL.revokeObjectURL(preview));
            setSelectedImages([]);
            setPreviews([]);
            setUploadProgress({});
        }, 2000);
    } catch (err) {
        // Error is already set in the promise rejection or fetch block
        if (err instanceof Error) {
            setError(err.message);
        }
    } finally {
        setUploading(false);
    }
  };
 
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Upload Images
      </h2>
 
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
 
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
 
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
                {uploading && uploadProgress[selectedImages[index].name] !== undefined && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col">
                        <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        <p className="text-white mt-2">{uploadProgress[selectedImages[index].name]}%</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
 
      {selectedImages.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : `Upload ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
 
        {processedItems.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6 mt-6">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Processed Images
            </h2>
            <div className="space-y-6">
              {processedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                >
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                            <Image
                                src={item.imageURL}
                                alt={`Processed image ${item.imageID}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">
                            Image ID: <span className="font-normal text-sm text-zinc-600 dark:text-zinc-400 break-all">{item.imageID}</span>
                        </h3>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-100 mt-2">
                            Count: <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{item.count}</span>
                        </p>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-100 mt-2">
                            Description:
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {item.description}
                        </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
 
 