"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const WIDE = "(min-width: 768px)";
const CALM = "(prefers-reduced-motion: reduce)";

type NetworkInformation = { saveData?: boolean };

function saveDataOn() {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData === true;
}

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(WIDE), window.matchMedia(CALM)];
  for (const q of queries) q.addEventListener("change", onChange);
  return () => {
    for (const q of queries) q.removeEventListener("change", onChange);
  };
}

const wantsVideo = () => window.matchMedia(WIDE).matches && !window.matchMedia(CALM).matches && !saveDataOn();

// The moving shelf behind the home hero. It is never rendered on the server
// and never mounts on a phone-width screen, with data saver on, or with
// reduced motion -- those visitors keep the poster frame underneath and
// download nothing extra. Once playing it fades in over the poster, which is
// the same frame, so there is no jump.
export default function HeroVideo({ className = "" }: { className?: string }) {
  const enabled = useSyncExternalStore(subscribe, wantsVideo, () => false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play only while the hero is on screen; there's no point decoding it
  // under the fold.
  useEffect(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;
    video.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={`${className} transition-opacity duration-[1600ms] ease-out ${playing ? "opacity-100" : "opacity-0"}`}
    >
      <source src="/media/hero-shelf-v2.webm" type="video/webm" />
      <source src="/media/hero-shelf-v2.mp4" type="video/mp4" />
    </video>
  );
}
