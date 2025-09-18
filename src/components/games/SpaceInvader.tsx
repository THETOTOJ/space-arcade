"use client";

import { useAudio } from "@/hooks/useAudio";
import { useGameState } from "@/hooks/useGameState";
import { Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { AsteroidModel } from "../models/AsteroidModel";
import { Ship1Model } from "../models/Ship1Model";
import { GameHUD } from "../ui/GameHUD";
import { GameOverScreen } from "../ui/GameOverScreen";
import { PauseMenu } from "../ui/PauseMenu";

// Types
type UseGameStateReturn = ReturnType<typeof useGameState>;

interface Laser {
  id: string;
  position: THREE.Vector3;
}

interface Asteroid {
  id: string;
  position: THREE.Vector3;
  health: number;
}

interface SpaceInvaderSceneProps {
  playerShip: "ship1";
  gameState: UseGameStateReturn;
  onGameOver: (reason: string) => void;
  onScoreAdd: (points: number) => void;
}

function SpaceInvaderScene({
  playerShip,
  gameState,
  onGameOver,
  onScoreAdd,
}: SpaceInvaderSceneProps) {
  const { playSound } = useAudio();
  const [playerX, setPlayerX] = useState(0);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  const PlayerShip = Ship1Model;

  const createAsteroids = (): Asteroid[] => {
    const newAsteroids: Asteroid[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        newAsteroids.push({
          id: `${Date.now()}-${row}-${col}`,
          position: new THREE.Vector3((col - 3.5) * 1.2, 3 - row * 0.8, 0),
          health: 3,
        });
      }
    }
    return newAsteroids;
  };

  useEffect(() => {
    if (gameState.gameState === "playing") {
      setAsteroids(createAsteroids());
      setLasers([]);
      setPlayerX(0);
    }
  }, [gameState.gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) =>
      setKeys((prev) => ({ ...prev, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) =>
      setKeys((prev) => ({ ...prev, [e.code]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (gameState.gameState !== "playing") return;

    if (keys["ArrowLeft"] || keys["KeyA"])
      setPlayerX((prev) => Math.max(-4, prev - 0.1));
    if (keys["ArrowRight"] || keys["KeyD"])
      setPlayerX((prev) => Math.min(4, prev + 0.1));

    if (Math.random() < 0.04) {
      setLasers((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          position: new THREE.Vector3(playerX, -2.5, 0),
        },
      ]);
      playSound("/sounds/shoot.mp3", 0.2);
    }

    setLasers((prev) =>
      prev
        .map((laser) => ({
          ...laser,
          position: new THREE.Vector3(
            laser.position.x,
            laser.position.y + 0.1,
            0
          ),
        }))
        .filter((laser) => laser.position.y < 5)
    );

    setAsteroids((prev) =>
      prev.map((ast) => ({
        ...ast,
        position: new THREE.Vector3(ast.position.x, ast.position.y - 0.005, 0),
      }))
    );

    setLasers((prevLasers) => {
      const remainingLasers: Laser[] = [];
      prevLasers.forEach((laser) => {
        let hit = false;
        setAsteroids(
          (prevAsteroids) =>
            prevAsteroids
              .map((ast) => {
                const distance = laser.position.distanceTo(ast.position);
                if (distance < 0.5 && !hit) {
                  hit = true;
                  ast.health--;
                  if (ast.health <= 0) {
                    playSound("/sounds/explosion.mp3");
                    onScoreAdd(10);
                    return null;
                  }
                }
                return ast;
              })
              .filter(Boolean) as Asteroid[]
        );
        if (!hit) remainingLasers.push(laser);
      });
      return remainingLasers;
    });

    asteroids.forEach((ast) => {
      if (ast.position.y < -2) {
        onGameOver("Asteroids reached you!");
        playSound("/sounds/gameover.mp3");
      }
    });

    if (asteroids.length === 0) {
      setAsteroids(createAsteroids());
      onScoreAdd(100);
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2.5} />
      <hemisphereLight intensity={1} groundColor={"#111"} />
      <Stars radius={100} depth={50} count={1000} factor={4} />

      <PlayerShip
        position={new THREE.Vector3(playerX, -2.5, 0)}
        rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
        scale={0.3}
        autoRotate={false}
      />

      {asteroids.map((ast) => (
        <AsteroidModel key={ast.id} position={ast.position} scale={0.2} />
      ))}

      {lasers.map((laser) => (
        <mesh key={laser.id} position={laser.position}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      ))}
    </>
  );
}

interface SpaceInvaderProps {
  playerShip: "ship1";
  enemyShip?: "ship1";
}

export function SpaceInvader({ playerShip, enemyShip }: SpaceInvaderProps) {
  const gameState = useGameState();

  useEffect(() => {
    gameState.startGame();
  }, []);

  return (
    <div className="h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <SpaceInvaderScene
          playerShip={playerShip}
          gameState={gameState}
          onGameOver={gameState.endGame}
          onScoreAdd={gameState.addScore}
        />
      </Canvas>

      <GameHUD
        score={gameState.score}
        onPause={gameState.pauseGame}
        extraInfo="A/D or ←/→ to move, auto-shooting"
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
