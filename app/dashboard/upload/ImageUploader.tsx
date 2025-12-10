"use client";
 
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image";
import { useRouter } from "next/navigation";
 
const storage = getStorage(app);
 
interface ProcessedItem {
  imageURL: string; // Public URL for display
  gsUri: string;    // GS URI for backend
  imageID: string;
  ai_count: number;
  description: string;
  manual_count?: number;
  notes?: string;
}
 
export function ImageUploader() {
  const router = useRouter();
  const { user, getJwt } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);
 
  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };
 
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
 
  const processFiles = (files: File[]) => {
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
 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };
 
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
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
 
      return new Promise<{ gsUri: string; downloadUrl: string }>((resolve, reject) => {
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
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const bucket = uploadTask.snapshot.ref.bucket;
                const path = uploadTask.snapshot.ref.fullPath;
                const gsUri = `gs://${bucket}/${path}`;
                resolve({ gsUri, downloadUrl });
            } catch (error) {
                console.error(error);
                setError(`Failed to get URL for ${file.name}.`);
                reject(error);
            }
          }
        );
      });
    });
 
    try {
        const uploadResults = await Promise.all(uploadPromises);
        const gsUris = uploadResults.map(result => result.gsUri);
       
        const token = await getJwt();
        const response = await fetch("/api/process-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ file_uris: gsUris, prompt:"đếm và giải thích cho tôi có bao nhiêu món trang sức trong khay này" }),
        });
 
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Backend processing failed." }));
            throw new Error(errorData.message || `Backend processing failed.`);
        }
       
        const result = await response.json();
        console.log("Backend response:", result);
 
        const newProcessedItems: ProcessedItem[] = result.data.items.map((item: any, index: number) => ({
            imageURL: uploadResults[index].downloadUrl,
            gsUri: uploadResults[index].gsUri,
            imageID: item.imageID,
            ai_count: item.count,
            description: item.description,
            manual_count: item.count, // Default manual_count to ai_count
            notes: "",
        }));
 
        setProcessedItems(newProcessedItems);
        setIsReportGenerated(true); // Report is generated, switch UI
 
        // Clear selections as the upload UI will be hidden
            previews.forEach((preview) => URL.revokeObjectURL(preview));
            setSelectedImages([]);
            setPreviews([]);
            setUploadProgress({});
    } catch (err) {
        // Error is already set in the promise rejection or fetch block
        if (err instanceof Error) {
            setError(err.message);
        }
    } finally {
        setUploading(false);
    }
  };
 
  const handleReportChange = (index: number, field: 'manual_count' | 'notes', value: string | number) => {
    const updatedItems = [...processedItems];
    const itemToUpdate = { ...updatedItems[index] };
 
    if (field === 'manual_count') {
        const numValue = value === '' ? undefined : Number(value);
        itemToUpdate[field] = isNaN(numValue as number) ? itemToUpdate.manual_count : numValue;
    } else {
        itemToUpdate[field] = String(value);
    }
   
    updatedItems[index] = itemToUpdate;
    setProcessedItems(updatedItems);
  };
 
  const handleSaveReport = async () => {
    if (!user) {
      setError("You must be logged in to save a report.");
      return;
    }
 
    setUploading(true); // Show loading state
    setError("");
 
    const reportPayload = processedItems.map(item => ({
      image_url: item.gsUri,
      ai_count: item.ai_count,
      manual_count: item.manual_count ?? item.ai_count, // Default to ai_count if manual is not set
      notes: item.notes || "",
    }));
 
    try {
      const token = await getJwt();
      const response = await fetch('/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reportPayload),
      });
 
      const result = await response.json();
 
      if (!response.ok || result.results?.[0]?.status === 'error') {
        throw new Error(result.results?.[0]?.message || 'Failed to save the report.');
      }
 
      const successMessage = result.results?.[0]?.message || 'Report saved successfully!';
      showToast(successMessage);
      handleNewUpload();
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard/report');
      }, 1200);
 
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while saving the report.');
      }
    } finally {
        setUploading(false);
    }
  };
 
  const handleNewUpload = () => {
    setProcessedItems([]);
    setIsReportGenerated(false);
    setError("");
  };
 
  return (
    <>
      {!isReportGenerated && (
    <div className="bg-sea-sub-blue rounded-lg shadow-lg p-4 sm:p-6 mb-6 border border-sea-gold/20">
      <h2 className="text-lg sm:text-xl font-semibold text-sea-gold mb-4">
        Upload Images
      </h2>
 
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-sea-gold bg-sea-blue/50"
            : "border-sea-blue hover:border-sea-gold"
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-sea-gray"
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
        <p className="mt-4 text-sm sm:text-base text-sea-light-gray">
          <span className="font-semibold text-sea-gold">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-xs sm:text-sm text-sea-gray">
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
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
 
      {previews.length > 0 && (
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
                        <p className="text-white mt-2 font-semibold drop-shadow-md">{uploadProgress[selectedImages[index].name]}%</p>
                    </div>
                  )}
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
                <p className="mt-1 text-xs text-sea-gray truncate">
                  {selectedImages[index].name}
                </p>
 
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
            className="w-full py-3 px-4 bg-sea-gold hover:bg-yellow-500 disabled:bg-gray-500 text-sea-blue font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : `Upload ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
        </div>
      )}
 
      {isReportGenerated && processedItems.length > 0 && (
        <>
          <div className="bg-sea-sub-blue rounded-lg shadow-lg p-4 sm:p-6 mt-6 border border-sea-gold/20">
            <h2 className="text-lg sm:text-xl font-semibold text-sea-gold mb-4">
              Processed Images
            </h2>
            <div className="space-y-6">
              {processedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start gap-4 p-4 bg-sea-blue border border-sea-sub-blue rounded-lg"
                >
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-black">
                            <Image
                                src={item.imageURL}
                                alt={`Processed image ${item.imageID}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <h3 className="font-semibold text-white">
                            Image ID: <span className="font-normal text-sm text-sea-gray break-all">{item.imageID}</span>
                        </h3>
                        <p className="font-semibold text-white mt-2">
                            AI Count: <span className="font-bold text-sea-gold text-lg">{item.ai_count}</span>
                        </p>
                        <div className="mt-2">
                            <label htmlFor={`manual_count_${index}`} className="font-semibold text-white">Manual Count:</label>
                            <input
                                id={`manual_count_${index}`}
                                type="number"
                                value={item.manual_count ?? ''}
                                onChange={(e) => handleReportChange(index, 'manual_count', e.target.value)}
                                className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                            />
                        </div>
                        <div className="mt-2">
                            <label htmlFor={`notes_${index}`} className="font-semibold text-white">Notes:</label>
                            <textarea
                                id={`notes_${index}`}
                                value={item.notes || ''}
                                onChange={(e) => handleReportChange(index, 'notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                            />
                        </div>
                        <p className="font-semibold text-white mt-2">
                            AI Description:
                        </p>
                        <p className="text-sm text-sea-light-gray mt-1">
                            {item.description}
                        </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSaveReport}
              disabled={uploading}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {uploading ? 'Saving...' : 'Save Report'}
            </button>
            <button
              onClick={handleNewUpload}
              disabled={uploading}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              New Upload
            </button>
          </div>
        </>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
      )}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 rounded-xl bg-green-600/90 px-4 py-3 shadow-2xl backdrop-blur">
          <p className="text-center text-sm font-semibold text-white">{toastMessage}</p>
        </div>
      )}
    </>
  );
}
 
 
 
 
 