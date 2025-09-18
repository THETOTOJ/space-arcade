"use client";

import { useAudio } from "@/hooks/useAudio";
import { useGameState } from "@/hooks/useGameState";
import { Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { AsteroidModel } from "../models/AsteroidModel";
import { Ship1Model } from "../models/Ship1Model";
import { Ship2Model } from "../models/Ship2Model";
import { GameHUD } from "../ui/GameHUD";
import { GameOverScreen } from "../ui/GameOverScreen";
import { PauseMenu } from "../ui/PauseMenu";

type ShipType = "ship1" | "ship2";
type ObjectType = "asteroid" | "enemy" | "laserItem";

interface GameObject {
  id: string;
  position: THREE.Vector3;
  lane: number;
  type: ObjectType;
  health: number;
}

interface Laser {
  id: string;
  position: THREE.Vector3;
  lane: number;
}

interface GalaxySurferSceneProps {
  playerShip: ShipType;
  enemyShip: ShipType;
  gameState: ReturnType<typeof useGameState>;
  onGameOver: (reason: string) => void;
  onScoreAdd: (points: number) => void;
}

function GalaxySurferScene({
  playerShip,
  enemyShip,
  gameState,
  onGameOver,
  onScoreAdd,
}: GalaxySurferSceneProps) {
  const { playSound } = useAudio();
  const [playerLane, setPlayerLane] = useState<number>(0);
  const [playerX, setPlayerX] = useState<number>(0);
  const [playerTilt, setPlayerTilt] = useState<number>(0);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [hasLaserItem, setHasLaserItem] = useState<boolean>(false);
  const [laserItemTimeout, setLaserItemTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const PlayerShip = playerShip === "ship1" ? Ship1Model : Ship2Model;
  const EnemyShip = enemyShip === "ship1" ? Ship1Model : Ship2Model;

  function equipLaserItem() {
    setHasLaserItem(true);
    if (laserItemTimeout) clearTimeout(laserItemTimeout);
    const timeout = setTimeout(() => {
      setHasLaserItem(false);
    }, 10000);
    setLaserItemTimeout(timeout);
  }

  useEffect(() => {
    if (gameState.gameState === "playing") {
      setObjects([]);
      setLasers([]);
      setPlayerLane(0);
      setPlayerX(0);
      setPlayerTilt(0);
      setHasLaserItem(false);
      if (laserItemTimeout) clearTimeout(laserItemTimeout);
    }
  }, [gameState.gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        setPlayerLane((prev) => Math.max(-1, prev - 1));
      if (e.code === "ArrowRight" || e.code === "KeyD")
        setPlayerLane((prev) => Math.min(1, prev + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useFrame(() => {
    if (gameState.gameState !== "playing") return;

    const targetX = playerLane;
    setPlayerX(THREE.MathUtils.lerp(playerX, targetX, 0.15));

    const targetTilt = playerLane * (Math.PI / 6);
    setPlayerTilt(THREE.MathUtils.lerp(playerTilt, targetTilt, 0.1));

    setLasers((prev) =>
      prev
        .map((laser) => ({
          ...laser,
          position: new THREE.Vector3(laser.lane, -2, laser.position.z + 0.3),
        }))
        .filter((laser) => laser.position.z < 10)
    );

    setObjects((prev) =>
      prev
        .map((obj) => ({
          ...obj,
          position: new THREE.Vector3(obj.lane, -2, obj.position.z - 0.2),
        }))
        .filter((obj) => obj.position.z > -3)
    );

    if (Math.random() < 0.03) {
      const lane = Math.floor(Math.random() * 3) - 1;
      const typeRand = Math.random();
      const type: ObjectType =
        typeRand < 0.65 ? "asteroid" : typeRand < 0.95 ? "enemy" : "laserItem";
      setObjects((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          position: new THREE.Vector3(lane, -2, 12),
          lane,
          type,
          health: 3,
        },
      ]);
    }

    setLasers((prevLasers) => {
      const remainingLasers: Laser[] = [];
      prevLasers.forEach((laser) => {
        let hit = false;
        setObjects(
          (prevObjects) =>
            prevObjects
              .map((obj) => {
                if (
                  obj.lane === laser.lane &&
                  Math.abs(obj.position.z - laser.position.z) < 0.5 &&
                  !hit &&
                  obj.type !== "laserItem"
                ) {
                  hit = true;
                  obj.health--;
                  if (obj.health <= 0) {
                    playSound("/sounds/explosion.mp3");
                    onScoreAdd(obj.type === "asteroid" ? 10 : 30);
                    return null;
                  }
                }
                return obj;
              })
              .filter(Boolean) as GameObject[]
        );
        if (!hit) remainingLasers.push(laser);
      });
      return remainingLasers;
    });

    objects.forEach((obj) => {
      const playerVisualLane = Math.round(playerX);
      if (
        obj.lane === playerVisualLane &&
        obj.position.z < -1.5 &&
        obj.position.z > -2.5
      ) {
        if (obj.type === "laserItem") {
          equipLaserItem();
          setObjects((prev) => prev.filter((o) => o.id !== obj.id));
        } else {
          onGameOver(
            "Hit by " + (obj.type === "asteroid" ? "Asteroid" : "Enemy")
          );
          playSound("/sounds/gameover.mp3");
        }
      }
    });

    if (hasLaserItem && Math.random() < 0.1) {
      const newLaser: Laser = {
        id: Math.random().toString(),
        position: new THREE.Vector3(playerX, -2, 0),
        lane: playerLane,
      };
      setLasers((prev) => [...prev, newLaser]);
      playSound("/sounds/shoot.mp3", 0.3);
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2.5} />
      <hemisphereLight intensity={1} groundColor={"#111"} />
      <Stars radius={100} depth={50} count={1000} factor={4} />

      <PlayerShip
        position={new THREE.Vector3(playerX, -2, 0)}
        rotation={new THREE.Euler(0, 0, playerTilt)}
        scale={0.35}
        autoRotate={false}
      />

      {objects.map((obj) => (
        <group key={obj.id}>
          {obj.type === "asteroid" ? (
            <AsteroidModel position={obj.position} scale={0.15} />
          ) : obj.type === "enemy" ? (
            <EnemyShip position={obj.position} scale={0.4} />
          ) : (
            <mesh position={obj.position}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshBasicMaterial color="yellow" />
            </mesh>
          )}
        </group>
      ))}

      {lasers.map((laser) => (
        <mesh key={laser.id} position={laser.position}>
          <boxGeometry args={[0.05, 0.05, 0.3]} />
          <meshBasicMaterial color="cyan" />
        </mesh>
      ))}

      {[-1, 0, 1].map((lane) => (
        <mesh
          key={lane}
          position={[lane, -2, 5]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1, 1.2, 16]} />
          <meshBasicMaterial color="white" transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  );
}

interface GalaxySurferProps {
  playerShip: ShipType;
  enemyShip: ShipType;
}

export function GalaxySurfer({ playerShip, enemyShip }: GalaxySurferProps) {
  const gameState = useGameState();

  useEffect(() => {
    gameState.startGame();
  }, []);

  return (
    <div className="h-screen bg-black relative">
      <Canvas
        camera={{ position: [0, 0, -5], fov: 75, rotation: [0, Math.PI, 0] }}
      >
        <GalaxySurferScene
          playerShip={playerShip}
          enemyShip={enemyShip}
          gameState={gameState}
          onGameOver={gameState.endGame}
          onScoreAdd={gameState.addScore}
        />
      </Canvas>

      <GameHUD
        score={gameState.score}
        onPause={gameState.pauseGame}
        extraInfo="A/D or ←/→ to switch lanes"
      />

      {gameState.gameState === "paused" && (
        <PauseMenu
          onResume={gameState.resumeGame}
          onRestart={gameState.startGame}
        />
      )}
      {gameState.gameState === "gameOver" && (
        <GameOverScreen
          score={gameState.score}
          reason={gameState.gameOverReason}
          onRestart={gameState.startGame}
        />
      )}
    </div>
  );
}
