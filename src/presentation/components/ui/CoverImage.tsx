import { useState } from 'react';

/** Imagem decorativa 16:9 (o título do card já descreve o conteúdo). Se falhar, mostra um fundo escuro neutro. */
export function CoverImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg className="cover cover--fallback" viewBox="0 0 16 9" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="cover-fallback" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#252a33" />
            <stop offset="1" stopColor="#101318" />
          </linearGradient>
        </defs>
        <rect width="16" height="9" fill="url(#cover-fallback)" />
      </svg>
    );
  }
  return <img className="cover" src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
