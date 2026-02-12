"use client";

import React, { useEffect, useState } from "react";

// Define the types of floating items
type FloatingItemType = "emoji" | "image";

interface FloatingItemConfig {
  type: FloatingItemType;
  value: string; // Emoji character or Image URL
}

// ==========================================
// CONFIGURATION AREA
// You can add emojis or image URLs here
// ==========================================
const ITEMS: FloatingItemConfig[] = [
  // Emojis
  { type: "emoji", value: "❤️" },
  { type: "emoji", value: "💖" },
  { type: "emoji", value: "💝" },
  { type: "emoji", value: "💕" },
  { type: "emoji", value: "💗" },

  // Example of how to add an image (uncomment and replace URL to use)
  // { type: "image", value: "/images/your-face.png" },
  // { type: "image", value: "https://example.com/face.png" },
];

interface FloatingElement {
  id: number;
  item: FloatingItemConfig;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

export default function ValentineTheme() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Helper to create a random element
    const createRandomElement = (idOffset: number = 0): FloatingElement => {
      const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {elements.map((el) => (
        <div
          key={el.id}
          className="valentine-heart absolute flex items-center justify-center"
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
              alt="floating decoration"
              className="w-full h-auto object-contain drop-shadow-md opacity-90"
            />
          )}
        </div>
      ))}
      <div className="absolute top-0 right-0 p-4 opacity-20 hover:opacity-100 transition-opacity">
        <span className="text-pink-400 text-xs">Happy Valentine's Day!</span>
      </div>
    </div>
  );
}
