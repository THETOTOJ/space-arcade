"use client";

import { useRouter } from "next/navigation";

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onResume, onRestart }: PauseMenuProps) {
  const router = useRouter();

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold text-white mb-6">PAUSED</h2>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
          >
            Resume
          </button>

          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
          >
            Restart
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
