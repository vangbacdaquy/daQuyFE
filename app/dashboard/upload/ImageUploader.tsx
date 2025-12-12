"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";
import { ProcessedImageCard } from "./components/ProcessedImageCard";
import { Toast } from "./components/Toast";
import { ErrorAlert } from "./components/ErrorAlert";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const storage = getStorage(app);

interface ProcessedItem {
  imageURL: string;
  gsUri: string;
  imageID: string;
  ai_count: number;
  description: string;
  manual_count?: number;
  notes?: string;
}

export function ImageUploader() {
  const router = useRouter();
  const { user, getJwt } = useAuth();
  
  // UI States
  const [step, setStep] = useState<"idle" | "selected" | "uploading" | "processing" | "complete">("idle");
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      // Cleanup object URLs
      previews.forEach(p => URL.revokeObjectURL(p));
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilesSelected = (files: File[]) => {
    setError("");
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast(`${file.name} is not a valid image type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      if (step === "idle") setStep("selected");
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setPreviews(newPreviews);
    
    if (newImages.length === 0) {
      setStep("idle");
    }
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;
    if (!user) {
      setError("You must be logged in to upload files.");
      return;
    }

    setStep("uploading");
    setError("");
    setUploadProgress({});

    try {
      // 1. Upload Images to Firebase Storage
      const uploadPromises = selectedImages.map((file) => {
        const today = new Date();
        const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
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
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            },
            (err) => reject(err),
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const bucket = uploadTask.snapshot.ref.bucket;
                const path = uploadTask.snapshot.ref.fullPath;
                resolve({ gsUri: `gs://${bucket}/${path}`, downloadUrl });
              } catch (e) { reject(e); }
            }
          );
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // 2. Call AI Processing
      setStep("processing");
      const gsUris = uploadResults.map(result => result.gsUri);
      const token = await getJwt();
      
      const response = await fetch("/api/process-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            file_uris: gsUris, 
            prompt: "" 
        }),
      });

      if (!response.ok) throw new Error("Backend processing failed.");
      
      const result = await response.json();
      
      const newProcessedItems: ProcessedItem[] = result.data.items.map((item: any, index: number) => ({
        imageURL: uploadResults[index].downloadUrl,
        gsUri: uploadResults[index].gsUri,
        imageID: item.imageID,
        ai_count: item.count,
        description: item.description,
        manual_count: item.count,
        notes: "",
      }));

      setProcessedItems(newProcessedItems);
      setStep("complete");
      
      // Cleanup previews
      previews.forEach((preview) => URL.revokeObjectURL(preview));
      setSelectedImages([]);
      setPreviews([]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setStep("selected"); // Go back so they can try again
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
    if (!user) return;
    
    // Optimistic UI could go here, but for now just a spinner state if needed
    // We reuse 'uploading' step for saving for simplicity or add a 'saving' step
    // But let's keep it simple: just show a toast and redirect
    
    const reportPayload = processedItems.map(item => ({
      image_url: item.gsUri,
      ai_count: item.ai_count,
      manual_count: item.manual_count ?? item.ai_count,
      ai_description: item.description,
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

      if (!response.ok) throw new Error('Failed to save report');
      
      showToast("Report saved successfully!");
      setTimeout(() => router.push('/dashboard/report'), 1000);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setProcessedItems([]);
    setSelectedImages([]);
    setPreviews([]);
    setStep("idle");
    setError("");
  };

  return (
    <div className="pb-24"> {/* Extra padding for sticky bottom actions */}
      
      {/* --- Step 1 & 2: Upload & Preview --- */}
      <AnimatePresence mode="wait">
        {(step === "idle" || step === "selected" || step === "uploading") && (
            <motion.div
                key="upload-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-sea-sub-blue/30 backdrop-blur-sm rounded-2xl shadow-xl border border-sea-gold/10 p-4 sm:p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-sea-gold text-sea-blue flex items-center justify-center text-sm font-bold">1</span>
                        Upload Images
                    </h2>
                    
                    <DropZone onFilesSelected={handleFilesSelected} disabled={step === "uploading"} />
                    <ErrorAlert error={error} />
                    <ImagePreview
                        previews={previews}
                        selectedImages={selectedImages}
                        uploadProgress={uploadProgress}
                        uploading={step === "uploading"}
                        onRemove={removeImage}
                    />
                </div>
            </motion.div>
        )}
      
        {/* --- Step 3: Processing (Skeleton) --- */}
        {step === "processing" && (
             <motion.div
                key="processing-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
             >
                <div className="flex items-center justify-center p-8 flex-col text-center">
                    <div className="relative w-20 h-20 mb-4">
                        <div className="absolute inset-0 border-4 border-sea-gold/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-sea-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Jewelry...</h3>
                    <p className="text-sea-light-gray">Our AI is counting items in your images.</p>
                </div>
                {/* Skeleton Cards */}
                {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-lg animate-pulse border border-white/10" />
                ))}
             </motion.div>
        )}

        {/* --- Step 4: Results --- */}
        {step === "complete" && (
            <motion.div
                key="results-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-sea-gold text-sea-blue flex items-center justify-center text-sm font-bold">2</span>
                        Review Results
                    </h2>
                    <button onClick={handleReset} className="text-sea-gray hover:text-white text-sm flex items-center gap-1">
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>

                <div className="space-y-4">
                  {processedItems.map((item, index) => (
                    <ProcessedImageCard
                      key={index}
                      item={item}
                      index={index}
                      onFieldChange={handleReportChange}
                    />
                  ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- Sticky Bottom Actions --- */}
      <AnimatePresence>
        {step === "selected" && (
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-20 left-4 right-4 z-40 md:static md:mt-6 md:mx-0 md:bottom-auto"
            >
                <button
                    onClick={handleUpload}
                    className="w-full py-4 bg-sea-gold text-sea-blue font-bold text-lg rounded-xl shadow-2xl shadow-black/50 hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Process {selectedImages.length} Images <ArrowRight size={20} />
                </button>
            </motion.div>
        )}

        {step === "complete" && (
             <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-20 left-4 right-4 z-40 md:static md:mt-6 md:mx-0 md:bottom-auto"
            >
                <button
                    onClick={handleSaveReport}
                    className="w-full py-4 bg-sea-gold text-sea-blue font-bold text-lg rounded-xl shadow-2xl shadow-black/50 hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Save Report
                </button>
            </motion.div>
        )}
      </AnimatePresence>
      
      <Toast message={toastMessage} />
    </div>
  );
}
