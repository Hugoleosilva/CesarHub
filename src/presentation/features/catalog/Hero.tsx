import { useEffect, useState } from 'react';
import { CoverImage } from '../../components/ui/CoverImage';

export type HeroSlide = {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  /** Botão que abre um painel, ou link externo (ex.: comunicados). */
  action: { label: string; onClick: () => void } | { label: string; href: string };
};

const ROTATION_MS = 7000;

/** Banner rotativo; pausa ao passar o mouse ou focar nele. */
export function Hero({ slides }: { slides: readonly HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATION_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const current = slides[index % Math.max(count, 1)];
  if (!current) return null;
  const { action } = current;

  return (
    <section
      className="hero"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero__media">
        <CoverImage key={current.id} src={current.image} />
      </div>
      <div className="hero__content">
        <span className="tag">{current.tag}</span>
        <h2 className="hero__title">{current.title}</h2>
        <p className="hero__desc">{current.description}</p>
        {'href' in action ? (
          <a className="btn btn--accent" href={action.href} target="_blank" rel="noopener noreferrer">
            {action.label}
          </a>
        ) : (
          <button type="button" className="btn btn--accent" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {count > 1 && (
        <div className="hero__dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={i === index ? 'is-active' : undefined}
              aria-label={`Destaque ${i + 1}: ${slide.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
