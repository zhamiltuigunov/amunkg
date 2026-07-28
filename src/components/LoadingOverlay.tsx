import { motion, AnimatePresence } from "motion/react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  lang?: "ru" | "en";
}

export default function LoadingOverlay({ isLoading, message, lang = "ru" }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500"
            />
            {/* Inner pulsing circle */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono"
          >
            {message || (lang === "en" ? "Processing..." : "ОБРАБОТКА...")}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
