"use client";

import React, { useEffect, useState } from "react";
import { useSettingsStore, useAuthStore } from "@/lib/store";
import { FloatingItemConfig } from "@/types";
import styles from "./ValentineTheme.module.css";

interface FloatingElement {
  id: number;
  item: FloatingItemConfig;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

export default function ValentineTheme() {
  const { valentineEnabled, valentineItems } = useSettingsStore();
  const { isHydrated } = useAuthStore();
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    if (!valentineEnabled || !isHydrated || valentineItems.length === 0) {
      setElements([]);
      return;
    }

    // Helper to create a random element
    const createRandomElement = (idOffset: number = 0): FloatingElement => {
      const randomItem = valentineItems[Math.floor(Math.random() * valentineItems.length)];
      return {
        id: Date.now() + idOffset,
        item: randomItem,
        left: Math.random() * 100, // Random horizontal position
        animationDuration: 10 + Math.random() * 10, // Slow float (10-20s)
        size: 1 + Math.random() * 1.5, // Random size
        delay: Math.random() * 5, // Random delay
      };
    };

    // Creating initial batch
    const initialElements: FloatingElement[] = Array.from({ length: 15 }).map(
      (_, i) => createRandomElement(i)
    );
    setElements(initialElements);

    // Interval to add new elements periodically
    const interval = setInterval(() => {
      setElements((prev) => {
        const newElement = createRandomElement();
        // Keep only last 30 elements to prevent DOM overload
        return [...prev.slice(-29), newElement];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [valentineEnabled, valentineItems, isHydrated]);

  if (!isHydrated || !valentineEnabled || valentineItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.valentineContainer}>
      {elements.map((el) => (
        <div
          key={el.id}
          className={styles.valentineHeart}
          style={{
            left: `${el.left}%`,
            width: el.item.type === "image" ? `${el.size * 50}px` : undefined, // Base width for images
            fontSize: el.item.type === "emoji" ? `${el.size}rem` : undefined,
            animationDuration: `${el.animationDuration}s`,
            animationDelay: `${el.delay}s`,
          }}
        >
          {el.item.type === "emoji" ? (
            <span>{el.item.value}</span>
          ) : (
            <img
              src={el.item.value}
              alt="Floating heart decoration"
              className="w-full h-auto object-contain drop-shadow-md opacity-90"
              onError={(e) => {
                // Remove failed images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
