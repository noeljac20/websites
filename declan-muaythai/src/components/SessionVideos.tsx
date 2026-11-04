import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Clip = {
  src: string;
  poster: string;
  title: string;
  caption: string;
  label: string;
};

export const SESSION_CLIPS: Clip[] = [
  {
    src: "/videos/session-pads.mp4",
    poster: "/videos/session-pads-poster.jpg",
    title: "Pad work",
    caption: "Declan on the pads with his coach in the ring at The Headhunters Gym.",
    label: "Declan doing pad work with his coach in a boxing ring",
  },
  {
    src: "/videos/session-kids.mp4",
    poster: "/videos/session-kids-poster.jpg",
    title: "Kids session",
    caption: "A kids session. Stance, guard and pad work at a pace that suits the child.",
    label: "Declan coaching a child on the pads in the gym",
  },
];

/**
 * Two portrait training clips. Each plays muted while on screen and pauses when scrolled away.
 * Visitors can unmute or pause. Under reduced-motion settings nothing autoplays.
 */
export function SessionVideos({ clips = SESSION_CLIPS, className }: { clips?: Clip[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:gap-6", className)}>
      {clips.map((c) => (
        <VideoCard key={c.src} clip={c} />
      ))}
    </div>
  );
}

function VideoCard({ clip }: { clip: Clip }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setAutoplay(false);
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function toggleSound() {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) el.play().catch(() => {});
  }

  return (
    <figure className="card overflow-hidden">
      <div className="relative aspect-[9/16] bg-ink-2">
        <video
          ref={ref}
          src={clip.src}
          poster={clip.poster}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={autoplay}
          aria-label={clip.label}
          className="h-full w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[linear-gradient(180deg,transparent,rgba(10,10,11,0.75))] p-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pause ${clip.title} video` : `Play ${clip.title} video`}
            className="grid size-11 place-items-center rounded-full bg-ink/80 text-cream backdrop-blur hover:bg-ink"
          >
            {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? `Turn sound on for ${clip.title} video` : `Mute ${clip.title} video`}
            aria-pressed={!muted}
            className="grid size-11 place-items-center rounded-full bg-ink/80 text-cream backdrop-blur hover:bg-ink"
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      </div>
      <figcaption className="px-4 py-3">
        <p className="text-[15px] font-semibold text-cream">{clip.title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-fog">{clip.caption}</p>
      </figcaption>
    </figure>
  );
}
