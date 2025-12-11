"use client";
 
interface ToastProps {
  message: string | null;
}
 
export function Toast({ message }: ToastProps) {
  if (!message) return null;
 
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 rounded-xl bg-green-600/90 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-center text-sm font-semibold text-white">{message}</p>
    </div>
  );
}
 
 