"use client"; 
import { GalaxySurfer } from "@/components/games/GalaxySurfer";
import { useEffect, useState } from "react";

export default function GalaxySurferPage() {
  const [playerShip, setPlayerShip] = useState<"ship1" | "ship2">("ship1");
  const [enemyShip, setEnemyShip] = useState<"ship1" | "ship2">("ship2");

  useEffect(() => {
    const selectedShip =
      (localStorage.getItem("selectedShip") as "ship1" | "ship2") || "ship1";
    setPlayerShip(selectedShip);
    setEnemyShip(selectedShip === "ship1" ? "ship2" : "ship1");
  }, []);

  return <GalaxySurfer playerShip={playerShip} enemyShip={enemyShip} />;
}
