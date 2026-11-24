import { useRef } from 'react';
import type { ReactNode } from 'react';

/** Fileira rolável com snap e setas; em telas de toque basta arrastar. */
export function Carousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy?.({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="carousel">
      <button type="button" className="carousel__btn carousel__btn--prev" aria-label="Anterior" onClick={() => scroll(-1)}>
        ‹
      </button>
      <div ref={trackRef} className="carousel__track">
        {children}
      </div>
      <button type="button" className="carousel__btn carousel__btn--next" aria-label="Próximo" onClick={() => scroll(1)}>
        ›
      </button>
    </div>
  );
}
