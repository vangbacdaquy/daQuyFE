"use client";
 
interface ErrorAlertProps {
  error: string | null;
}
 
export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
 
  return (
    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
  );
}
 
 