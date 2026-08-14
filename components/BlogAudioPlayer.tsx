"use client";

import { useRef } from "react";

type BlogAudioPlayerProps = {
  title: string;
  src: string;
  description?: string;
};

export function BlogAudioPlayer({ title, src, description }: BlogAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <section className="blog-audio-player" aria-label="Article audio">
      <div>
        <p className="eyebrow">Listen to this article</p>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <audio ref={audioRef} controls preload="metadata">
        <source src={src} />
      </audio>
      <div className="blog-audio-actions">
        <button type="button" className="button button-secondary" onClick={() => void audioRef.current?.play()}>
          Play
        </button>
        <button type="button" className="button button-secondary" onClick={() => audioRef.current?.pause()}>
          Pause
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }}
        >
          Stop
        </button>
      </div>
    </section>
  );
}
