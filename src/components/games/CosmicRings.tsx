"use client";

import { useAudio } from "@/hooks/useAudio";
import { useGameState } from "@/hooks/useGameState";
import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Ship1Model } from "../models/Ship1Model";
import { Ship2Model } from "../models/Ship2Model";
import { GameHUD } from "../ui/GameHUD";
import { GameOverScreen } from "../ui/GameOverScreen";
import { PauseMenu } from "../ui/PauseMenu";

interface Ring {
  id: number;
  position: THREE.Vector3;
  collected: boolean;
}

interface GameProps {
  playerShip: "ship1" | "ship2";
  gameState: ReturnType<typeof useGameState>;
  onGameOver: (reason: string) => void;
  onScoreAdd: (points: number) => void;
}

function CosmicRingsScene({
  playerShip,
  gameState,
  onGameOver,
  onScoreAdd,
}: GameProps) {
  const { playSound } = useAudio();
  const { camera } = useThree();
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0, 0));
  const [playerRotation, setPlayerRotation] = useState(
    new THREE.Euler(0, 0, 0)
  );
  const [rings, setRings] = useState<Ring[]>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostEnergy, setBoostEnergy] = useState(100);
  const [boostCooldown, setBoostCooldown] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [ringsInitialized, setRingsInitialized] = useState(false);
  const wallMaterialRef = useRef<THREE.MeshPhongMaterial>(null);

  const PlayerShip = playerShip === "ship1" ? Ship1Model : Ship2Model;

  const NUM_RINGS = 40;
  const MAP_SIZE = 200;
  const RING_RADIUS = 4;
  const PLAYER_RADIUS = 1;
  const FORWARD_SPEED = 0.8;
  const BOOST_SPEED = 1.6;
  const TURN_SPEED = 1.2;

  const initializeRings = () => {
    const newRings: Ring[] = [];
    const safeZone = 20;

    for (let i = 0; i < NUM_RINGS; i++) {
      let position;
      let attempts = 0;

      do {
        position = new THREE.Vector3(
          (Math.random() - 0.5) * (MAP_SIZE - safeZone * 2),
          (Math.random() - 0.5) * (MAP_SIZE - safeZone * 2),
          (Math.random() - 0.5) * (MAP_SIZE - safeZone * 2)
        );
        attempts++;
      } while (position.length() < safeZone && attempts < 10);

      newRings.push({
        id: i,
        position: position,
        collected: false,
      });
    }
    setRings(newRings);
    setRingsInitialized(true);
  };

  useEffect(() => {
    if (gameState.gameState === "playing") {
      setPlayerPos(new THREE.Vector3(0, 0, 0));
      setPlayerRotation(new THREE.Euler(0, 0, 0));
      setGameTime(0);
      setIsBoosting(false);
      setBoostEnergy(100);
      setBoostCooldown(0);
      setRingsInitialized(false);
      initializeRings();
    }
  }, [gameState.gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.code]: true }));
      if (
        (e.code === "ShiftLeft" || e.code === "ShiftRight") &&
        boostEnergy > 20 &&
        boostCooldown <= 0
      ) {
        setIsBoosting(true);
        setBoostEnergy((prev) => prev - 20);
        setBoostCooldown(5);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.code]: false }));
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        setIsBoosting(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [boostEnergy, boostCooldown]);

  useFrame((state, delta) => {
    if (gameState.gameState !== "playing" || !ringsInitialized) return;

    setGameTime((prev) => prev + delta);

    if (wallMaterialRef.current) {
      wallMaterialRef.current.opacity =
        Math.sin(state.clock.elapsedTime) * 0.1 + 0.2;
    }

    if (boostEnergy < 100 && !isBoosting) {
      setBoostEnergy((prev) => Math.min(100, prev + delta * 10));
    }
    if (boostCooldown > 0) {
      setBoostCooldown((prev) => Math.max(0, prev - delta));
    }

    const currentSpeed = isBoosting ? BOOST_SPEED : FORWARD_SPEED;
    const newPos = playerPos.clone();
    const newRotation = playerRotation.clone();

    const forwardDirection = new THREE.Vector3(0, 0, currentSpeed);
    forwardDirection.applyEuler(playerRotation);
    newPos.add(forwardDirection);

    let bankAngle = 0;
    let pitchChange = 0;
    let yawChange = 0;

    if (keys["KeyA"] || keys["ArrowLeft"]) {
      yawChange = -TURN_SPEED * delta;
      bankAngle = -Math.PI / 3;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      yawChange = TURN_SPEED * delta;
      bankAngle = Math.PI / 3;
    }
    if (keys["KeyW"] || keys["ArrowUp"]) {
      pitchChange = TURN_SPEED * delta;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
      pitchChange = -TURN_SPEED * delta;
    }

    newRotation.x += pitchChange;
    newRotation.y += yawChange;
    newRotation.z = THREE.MathUtils.lerp(newRotation.z, bankAngle, 0.15);

    if (Math.abs(newRotation.x) > Math.PI * 2) {
      newRotation.x = newRotation.x % (Math.PI * 2);
    }
    if (Math.abs(newRotation.y) > Math.PI * 2) {
      newRotation.y = newRotation.y % (Math.PI * 2);
    }

    newPos.x = THREE.MathUtils.clamp(newPos.x, -MAP_SIZE / 2, MAP_SIZE / 2);
    newPos.y = THREE.MathUtils.clamp(newPos.y, -MAP_SIZE / 2, MAP_SIZE / 2);
    newPos.z = THREE.MathUtils.clamp(newPos.z, -MAP_SIZE / 2, MAP_SIZE / 2);

    setPlayerPos(newPos);
    setPlayerRotation(newRotation);

    const cameraOffset = new THREE.Vector3(0, 3, -12);
    cameraOffset.applyEuler(playerRotation);
    const targetCameraPos = newPos.clone().add(cameraOffset);

    camera.position.lerp(targetCameraPos, 0.1);

    const lookAheadPos = newPos.clone();
    const lookDirection = new THREE.Vector3(0, 0, 5);
    lookDirection.applyEuler(playerRotation);
    lookAheadPos.add(lookDirection);
    camera.lookAt(lookAheadPos);

    const updatedRings = rings.map((ring) => {
      if (!ring.collected) {
        const distance = playerPos.distanceTo(ring.position);
        if (distance < RING_RADIUS + PLAYER_RADIUS) {
          playSound("/sounds/ring-pass.mp3");
          onScoreAdd(1);
          return { ...ring, collected: true };
        }
      }
      return ring;
    });

    if (JSON.stringify(updatedRings) !== JSON.stringify(rings)) {
      setRings(updatedRings);
    }

    const allRingsCollected = updatedRings.every((ring) => ring.collected);
    if (allRingsCollected && updatedRings.length > 0 && ringsInitialized) {
      onGameOver(`Completed! Time: ${gameTime.toFixed(2)}s`);
      playSound("/sounds/game-win.mp3");
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2.5} />
      <hemisphereLight intensity={1} groundColor={"#111"} />
      <Stars radius={200} depth={100} count={2000} factor={6} />

      {[
        {
          pos: [MAP_SIZE / 2, 0, 0],
          rot: [0, Math.PI / 2, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
        {
          pos: [-MAP_SIZE / 2, 0, 0],
          rot: [0, -Math.PI / 2, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
        {
          pos: [0, MAP_SIZE / 2, 0],
          rot: [-Math.PI / 2, 0, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
        {
          pos: [0, -MAP_SIZE / 2, 0],
          rot: [Math.PI / 2, 0, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
        {
          pos: [0, 0, MAP_SIZE / 2],
          rot: [0, Math.PI, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
        {
          pos: [0, 0, -MAP_SIZE / 2],
          rot: [0, 0, 0],
          args: [MAP_SIZE, MAP_SIZE],
        },
      ].map((wall, i) => (
        <mesh
          key={i}
          position={wall.pos as [number, number, number]}
          rotation={wall.rot as [number, number, number]}
        >
          <planeGeometry args={wall.args as [number, number]} />
          <meshPhongMaterial
            ref={wallMaterialRef}
            color="cyan"
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <group position={playerPos} rotation={playerRotation}>
        <PlayerShip
          position={new THREE.Vector3(0, 0, 0)}
          rotation={new THREE.Euler(0, 0, 0)}
          scale={1}
          autoRotate={false}
        />

        {isBoosting && (
          <>
            <mesh position={[0, 0, -2]}>
              <coneGeometry args={[0.5, 3, 8]} />
              <meshBasicMaterial color="#00aaff" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0, -1.5]}>
              <coneGeometry args={[0.3, 2, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
            {/* Bloom effect around ship */}
            <mesh>
              <sphereGeometry args={[2, 16, 16]} />
              <meshBasicMaterial color="cyan" transparent opacity={0.1} />
            </mesh>
          </>
        )}
      </group>

      {rings.map((ring) => (
        <group key={ring.id} position={ring.position}>
          {!ring.collected && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[RING_RADIUS, 0.3, 12, 32]} />
              <meshStandardMaterial
                color="gold"
                transparent
                opacity={1}
                emissive="gold"
                emissiveIntensity={0.1}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

export function CosmicRings({ playerShip }: { playerShip: "ship1" | "ship2" }) {
  const gameState = useGameState();

  useEffect(() => {
    gameState.startGame();
  }, []);

  return (
    <div className="h-screen bg-black relative">
      <Canvas camera={{ position: [0, 2, -10], fov: 75 }}>
        <CosmicRingsScene
          playerShip={playerShip}
          gameState={gameState}
          onGameOver={gameState.endGame}
          onScoreAdd={gameState.addScore}
        />
      </Canvas>

      <GameHUD
        score={gameState.score}
        onPause={gameState.pauseGame}
        extraInfo="A/D: Bank & Turn | W/S: Dive/Climb | Shift: Boost - Do loops and barrel rolls!"
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
