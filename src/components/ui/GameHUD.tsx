"use client";
interface GameHUDProps {
  score: number;
  onPause: () => void;
  extraInfo?: string;
}

export function GameHUD({ score, onPause, extraInfo }: GameHUDProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 text-white">
      <div className="space-y-1">
        <div className="text-2xl font-bold">Score: {score}</div>
        {extraInfo && <div className="text-sm">{extraInfo}</div>}
      </div>

      <button
        onClick={onPause}
        className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg"
      >
        Pause
      </button>
    </div>
  );
}
