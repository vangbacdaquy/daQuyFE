"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          className="fixed bottom-24 md:bottom-10 left-1/2 z-50 w-[90vw] max-w-sm rounded-xl bg-gray-900/90 border border-white/10 px-4 py-3 shadow-2xl backdrop-blur-lg flex items-center gap-3"
        >
          <CheckCircle2 className="text-green-500" size={20} />
          <p className="text-sm font-medium text-white">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
