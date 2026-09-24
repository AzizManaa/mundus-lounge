"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import unlitImage from "../../public/images/mundus-about-one.webp";
import litImage from "../../public/images/mundus-about-one-lit.webp";

export function AboutEmberImage({ alt }: { alt: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [litImageReady, setLitImageReady] = useState(false);

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
    <div
      className="mundus-image-frame mundus-ember-scene aspect-square sm:aspect-[4/3]"
      data-lit={inView && litImageReady}
      ref={sceneRef}
    >
      <Image
        alt={alt}
        className="object-cover"
        fill
        placeholder="blur"
        sizes="(min-width: 1024px) 34vw, 100vw"
        src={unlitImage}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="mundus-ember-scene__lit object-cover"
        fill
        onLoad={() => setLitImageReady(true)}
        sizes="(min-width: 1024px) 34vw, 100vw"
        src={litImage}
      />
      <span aria-hidden="true" className="mundus-ember-scene__glow" />
    </div>
  );
}
