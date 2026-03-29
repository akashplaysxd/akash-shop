"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-gray-400 mb-6">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-green-500 text-black font-semibold flex items-center gap-2 mx-auto hover:bg-green-400"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    </div>
  );
}
