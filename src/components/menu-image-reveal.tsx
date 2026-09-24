"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import drinksImage from "../../public/images/mundus-menu-drinks.webp";
import drinksLitImage from "../../public/images/mundus-menu-drinks-v2.webp";
import shishaImage from "../../public/images/mundus-menu-shisha.webp";
import shishaLitImage from "../../public/images/mundus-menu-shisha-v2.webp";

export function MenuImageReveal({ variant }: { variant: "drinks" | "shisha" }) {
  const sceneRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [litImageReady, setLitImageReady] = useState(false);
  const originalImage = variant === "drinks" ? drinksImage : shishaImage;
  const litImage = variant === "drinks" ? drinksLitImage : shishaLitImage;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      className={`mundus-menu-reveal mundus-menu-reveal--${variant} absolute inset-0`}
      data-lit={inView && litImageReady}
      ref={sceneRef}
    >
      <Image alt="" className="object-cover" fill placeholder="blur" sizes="(min-width: 768px) 30vw, 100vw" src={originalImage} />
      <Image
        alt=""
        aria-hidden="true"
        className="mundus-menu-reveal__lit object-cover"
        fill
        onLoad={() => setLitImageReady(true)}
        sizes="(min-width: 768px) 30vw, 100vw"
        src={litImage}
      />
      <span aria-hidden="true" className="mundus-menu-reveal__glow" />
    </span>
  );
}
