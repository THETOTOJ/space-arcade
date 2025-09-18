"use client";

import { Ship1Model } from "@/components/models/Ship1Model";
import { Ship2Model } from "@/components/models/Ship2Model";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as THREE from "three";

export default function HomePage() {
  const router = useRouter();
  const [selectedShip, setSelectedShip] = useState<"ship1" | "ship2">("ship1");

  const PlayerShip = selectedShip === "ship1" ? Ship1Model : Ship2Model;

  const toggleShip = () => {
    setSelectedShip((prev) => (prev === "ship1" ? "ship2" : "ship1"));
  };

  const navigateToGame = (game: string) => {
    localStorage.setItem("selectedShip", selectedShip);
    router.push(`/${game}`);
  };

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 1.5, 8], fov: 75 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[0, 10, 5]} intensity={2.5} />
          <hemisphereLight intensity={1} groundColor={"#111"} />
          <Stars radius={300} depth={60} count={2000} factor={7} />
          <PlayerShip
            position={new THREE.Vector3(0, 0, 0)}
            scale={2}
            autoRotate={true}
          />
        </Canvas>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between items-center text-white">
        <div className="mt-8 text-center">
          <p className="text-4xl text-cyan-300 animate-pulse">
            INSERT TOKEN TO PLAY
          </p>
          <p className="text-lg mb-4">
            Current Ship:{" "}
            <span className="text-cyan-400 font-bold">
              {selectedShip.toUpperCase()}
            </span>
          </p>
          <button
            onClick={toggleShip}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors duration-200"
          >
            Change Ship
          </button>
        </div>

        <div className="mb-12 space-y-6">
          <button
            onClick={() => navigateToGame("galaxy-surfer")}
            className="w-80 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            🌌 Galaxy Surfer
          </button>

          <button
            onClick={() => navigateToGame("space-invader-hardly-know-er")}
            className="w-80 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            👾 Space Invader
          </button>

          <button
            onClick={() => navigateToGame("cosmic-rings")}
            className="w-80 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            💫 Cosmic Rings
          </button>
        </div>
      </div>
    </div>
  );
}
