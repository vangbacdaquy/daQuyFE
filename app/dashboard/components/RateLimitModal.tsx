"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function RateLimitModal({ isOpen, onClose, message }: RateLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-sea-sub-blue border border-sea-gold rounded-xl shadow-2xl p-6 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sea-gold/20 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-sea-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Giới hạn lượt dùng
              </h3>
              
              <p className="text-sea-light-gray mb-6">
                {message || "Bạn đã hết lượt thử. Vui lòng đợi một chút."}
              </p>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-sea-gold hover:bg-yellow-500 text-sea-blue font-bold rounded-lg transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
