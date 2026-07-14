import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
};

export function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [index, slides.length, interval]);

  if (slides.length === 0) return null;

  const go = (dir: number) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-[5/2]">
        {slides.map((slide, i) => {
          const content = (
            <>
              <img
                src={slide.image}
                alt={slide.title || `海报 ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 text-white">
                  {slide.title && (
                    <div className="text-base font-bold">{slide.title}</div>
                  )}
                  {slide.subtitle && (
                    <div className="text-[11px] opacity-90">{slide.subtitle}</div>
                  )}
                </div>
              )}
            </>
          );
          return (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === index ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              {slide.link ? (
                slide.link.startsWith("http") ? (
                  <a
                    href={slide.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full w-full"
                  >
                    {content}
                  </a>
                ) : (
                  <Link to={slide.link} className="block h-full w-full">
                    {content}
                  </Link>
                )
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="上一张"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="下一张"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                )}
                aria-label={`切换到第 ${i + 1} 张`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
