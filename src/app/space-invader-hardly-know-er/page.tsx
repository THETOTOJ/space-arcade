"use client"; 
import { SpaceInvader } from "@/components/games/SpaceInvader";
import { useEffect, useState } from "react";

export default function SpaceInvaderPage() {
  const [playerShip, setPlayerShip] = useState<"ship1" | "ship2">("ship1");
  const [enemyShip, setEnemyShip] = useState<"ship1" | "ship2">("ship2");

  useEffect(() => {
    const selectedShip =
      (localStorage.getItem("selectedShip") as "ship1" | "ship2") || "ship1";
    setPlayerShip(selectedShip);
    setEnemyShip(selectedShip === "ship1" ? "ship2" : "ship1");
  }, []);

  return <SpaceInvader playerShip={playerShip} enemyShip={enemyShip} />;
}
