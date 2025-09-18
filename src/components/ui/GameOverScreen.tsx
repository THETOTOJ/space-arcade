"use client";

import { useRouter } from "next/navigation";

interface GameOverScreenProps {
  score: number;
  reason: string;
  onRestart: () => void;
}

export function GameOverScreen({
  score,
  reason,
  onRestart,
}: GameOverScreenProps) {
  const router = useRouter();

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg text-center max-w-md">
        <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
        <p className="text-white mb-2">Reason: {reason}</p>
        <p className="text-cyan-400 text-2xl mb-6">Score: {score}</p>

        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
          >
            Give It Another Go
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
          >
            Game Selection
          </button>
        </div>
      </div>
    </div>
  );
}
