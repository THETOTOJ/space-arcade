"use client"; 
import { CosmicRings } from "@/components/games/CosmicRings";
import { useEffect, useState } from "react";

export default function CosmicRingsPage() {
  const [playerShip, setPlayerShip] = useState<"ship1" | "ship2">("ship1");

  useEffect(() => {
    const selectedShip =
      (localStorage.getItem("selectedShip") as "ship1" | "ship2") || "ship1";
    setPlayerShip(selectedShip);
  }, []);

  return <CosmicRings playerShip={playerShip} />;
}
