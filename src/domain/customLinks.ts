import type { Service } from './service';

/** Link pessoal, criado e guardado pelo próprio usuário. */
export type CustomLink = {
  readonly id: string;
  readonly title: string;
  /** Opcional; vazio mostra o domínio do link no card. */
  readonly description: string;
  readonly url: string;
};

export type LinkDraft = { title: string; description: string; url: string };
export type LinkErrors = { title?: string; description?: string; url?: string };
export type LinkValidation =
  | { ok: true; value: LinkDraft }
  | { ok: false; errors: LinkErrors };

export const CUSTOM_LINKS_CATEGORY = 'Links externos';
const MAX_TITLE = 40;
const MAX_DESCRIPTION = 80;

export function normalizeHttpUrl(raw: string): string | null {
  // Qualquer esquema que não seja http(s) é recusado ("javascript:", "mailto:", "ftp://"...).
  // "localhost:3000" passa porque o ":" é seguido de porta, não de um esquema.
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(raw) && !/^https?:/i.test(raw)) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.username || url.password) return null; // "https://x@evil.com" disfarça o destino real
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function validateLinkDraft(draft: LinkDraft): LinkValidation {
  const errors: LinkErrors = {};
  const title = draft.title.trim();
  const description = draft.description.trim();
  const rawUrl = draft.url.trim();

  if (!title) errors.title = 'Informe um título.';
  else if (title.length > MAX_TITLE) errors.title = `Use no máximo ${MAX_TITLE} caracteres.`;

  if (description.length > MAX_DESCRIPTION) errors.description = `Use no máximo ${MAX_DESCRIPTION} caracteres.`;

  let url = '';
  if (!rawUrl) errors.url = 'Informe o endereço do link.';
  else {
    const normalized = normalizeHttpUrl(rawUrl);
    if (normalized) url = normalized;
    else errors.url = 'Endereço inválido. Ex.: https://meu-sistema.com.br';
  }

  return errors.title || errors.description || errors.url
    ? { ok: false, errors }
    : { ok: true, value: { title, description, url } };
}

function hueOf(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)!) % 360;
  return hash;
}

/** Capa 16:9 gerada: gradiente por título e a inicial em destaque. */
export function coverFor(title: string): string {
  const hue = hueOf(title);
  const initial = (Array.from(title.trim())[0] ?? '?').toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue} 65% 34%)"/><stop offset="1" stop-color="hsl(${(hue + 30) % 360} 60% 16%)"/>` +
    `</linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>` +
    `<text x="320" y="235" text-anchor="middle" font-family="system-ui,sans-serif" font-size="170" font-weight="700" fill="#fff" fill-opacity="0.9">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function customLinkToService(link: CustomLink): Service {
  let fallback = link.url;
  try {
    fallback = new URL(link.url).hostname;
  } catch {
    // mantém a URL completa se não for parseável
  }
  return {
    id: link.id,
    title: link.title,
    description: link.description || fallback,
    url: link.url,
    image: coverFor(link.title),
    type: 'Externo',
    keywords: [],
    featured: false,
  };
}
