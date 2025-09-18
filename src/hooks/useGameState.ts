"use client";

import { useState, useCallback } from "react";

export type GameState = "playing" | "paused" | "gameOver" | "menu";

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [gameOverReason, setGameOverReason] = useState("");

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setGameOverReason("");
  }, []);

  const pauseGame = useCallback(() => {
    setGameState("paused");
  }, []);

  const resumeGame = useCallback(() => {
    setGameState("playing");
  }, []);

  const endGame = useCallback((reason: string) => {
    setGameState("gameOver");
    setGameOverReason(reason);
  }, []);

  const resetGame = useCallback(() => {
    setGameState("menu");
    setScore(0);
    setGameOverReason("");
  }, []);

  const addScore = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  return {
    gameState,
    score,
    gameOverReason,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    addScore,
  };
};
