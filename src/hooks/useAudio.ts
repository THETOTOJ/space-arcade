"use client";

import { useCallback, useRef } from "react";

export const useAudio = () => {
  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundPath: string, volume = 0.3) => {
    try {
      if (!audioCache.current[soundPath]) {
        audioCache.current[soundPath] = new Audio(soundPath);
        audioCache.current[soundPath].volume = volume;
      }

      const audio = audioCache.current[soundPath];
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (error) {}
  }, []);

  return { playSound };
};
