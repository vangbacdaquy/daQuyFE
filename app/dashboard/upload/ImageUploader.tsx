"use client";
 
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";
import { ProcessedImageCard } from "./components/ProcessedImageCard";
import { Toast } from "./components/Toast";
import { ErrorAlert } from "./components/ErrorAlert";
 
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
 
  const handleFilesSelected = (files: File[]) => {
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
 
          <DropZone onFilesSelected={handleFilesSelected} disabled={uploading} />
 
          <ErrorAlert error={error} />
 
          <ImagePreview
            previews={previews}
            selectedImages={selectedImages}
            uploadProgress={uploadProgress}
            uploading={uploading}
            onRemove={removeImage}
          />
 
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
                <ProcessedImageCard
                  key={index}
                  item={item}
                  index={index}
                  onFieldChange={handleReportChange}
                />
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
     
      <ErrorAlert error={error} />
      <Toast message={toastMessage} />
    </>
  );
}
 