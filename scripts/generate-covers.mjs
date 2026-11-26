// Gera as capas sóbrias (SVG) dos serviços e dos cards de Orientações: fundo escuro com gradiente suave,
// brilho discreto na cor da área e um símbolo simples no centro (estilo streaming minimalista).
// Só mexe nas capas que o services.json aponta para `.svg`; ao trocar por uma foto (`npm run images`),
// o arquivo gerado deixa de ser usado e o serviço sobe sozinho na ordem da área.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('public/data/services.json', 'utf8'));

// Tom de cada área (aparece só como brilho suave no canto).
const AREAS = {
  Pessoas: { prefix: 'pessoas', tint: '#f08a4b' },
  Solicitações: { prefix: 'solicitacao', tint: '#5b94ff' },
  Ferramentas: { prefix: 'ferramentas', tint: '#38c0a3' },
  Aprendizagem: { prefix: 'aprendizagem', tint: '#a487ff' },
};

// Símbolos em grade 24x24, só traço (cada valor é o miolo de um <svg>).
const GLYPHS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.500 15.400 12 20 12 20z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
  calendarCheck: '<rect x="3.500" y="5" width="17" height="15.500" rx="2"/><path d="M3.500 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  calendar: '<rect x="3.500" y="5" width="17" height="15.500" rx="2"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
  card: '<rect x="2.500" y="5.500" width="19" height="13" rx="2"/><path d="M2.500 10h19M6 15h4"/>',
  dumbbell: '<path d="M6.500 8v8M17.500 8v8M3.500 10v4M20.500 10v4M6.500 12h11"/>',
  gift: '<rect x="3.500" y="9" width="17" height="4"/><path d="M5 13v8h14v-8M12 9v12M12 9c-2.500 0-4.500-1-4.500-2.800S9.500 4 12 9zM12 9c2.500 0 4.500-1 4.500-2.800S14.500 4 12 9z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.500 14c.900 1.300 2 2 3.500 2s2.600-.700 3.500-2M9 9.500v.5M15 9.500v.5"/>',
  chat: '<path d="M4 5.500h16v11H11l-4.500 4v-4H4z"/><path d="M8 10h8M8 13h5"/>',
  glasses: '<circle cx="6.500" cy="14" r="3.500"/><circle cx="17.500" cy="14" r="3.500"/><path d="M10 14h4M3 14l1.500-6M21 14l-1.500-6"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.500a2.500 2.500 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  wallet: '<path d="M4 7.500A2.500 2.500 0 0 1 6.500 5H19v3"/><path d="M4 7.500V18a2 2 0 0 0 2 2h14V8H6.500A2.500 2.500 0 0 1 4 7.500z"/><circle cx="16.500" cy="14" r="1"/>',
  fileCross: '<path d="M14 3H6.500A1.500 1.500 0 0 0 5 4.500v15A1.500 1.500 0 0 0 6.500 21h11a1.500 1.500 0 0 0 1.500-1.500V8z"/><path d="M14 3v5h5M12 11.500v5M9.500 14h5"/>',
  listCheck: '<path d="M10 6h11M10 12h11M10 18h11M3 6l1.500 1.500L7 5M3 12l1.500 1.500L7 11M3 18l1.500 1.500L7 17"/>',
  wrench: '<path d="M14.500 6.500a4 4 0 0 0 5 5L12 19a2.100 2.100 0 0 1-3-3l7.500-7.500a4 4 0 0 0-2-2z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.500"/><path d="M2.500 19h19"/>',
  building: '<path d="M5 21V4.500A1.500 1.500 0 0 1 6.500 3h8A1.500 1.500 0 0 1 16 4.500V21M16 10h2.500A1.500 1.500 0 0 1 20 11.500V21M3 21h18M9 7.500h3M9 11.500h3M9 15.500h3"/>',
  scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.500 6a3 3 0 0 0 5 0zM19 7l-2.500 6a3 3 0 0 0 5 0z"/>',
  kanban: '<rect x="3.500" y="4" width="17" height="16" rx="2"/><path d="M9 8v5M12 8v8M15 8v3"/>',
  fileText: '<path d="M14 3H6.500A1.500 1.500 0 0 0 5 4.500v15A1.500 1.500 0 0 0 6.500 21h11a1.500 1.500 0 0 0 1.500-1.500V8z"/><path d="M14 3v5h5M8.500 13h7M8.500 17h5"/>',
  folder: '<path d="M3 6.500A1.500 1.500 0 0 1 4.500 5h4.500l2 2.500h8A1.500 1.500 0 0 1 20.500 9v9a1.500 1.500 0 0 1-1.500 1.500H4.500A1.500 1.500 0 0 1 3 18z"/>',
  hash: '<path d="M9 4L7 20M17 4l-2 16M4 9h16M3.500 15h16"/>',
  mail: '<rect x="3" y="5.500" width="18" height="13" rx="2"/><path d="M3.500 7.500l8.500 6 8.500-6"/>',
  presentation: '<path d="M3 4h18M5 4v10.500h14V4M12 14.500V20M8.500 20h7M9 9.500l2 2 3-3.500"/>',
  monitor: '<rect x="3" y="4.500" width="18" height="12" rx="2"/><path d="M9 20.500h6M12 16.500v4"/>',
  shieldLock: '<path d="M12 3l7.500 3v5.500c0 4.500-3.200 7.800-7.500 9.500-4.300-1.700-7.500-5-7.500-9.500V6z"/><rect x="9" y="11" width="6" height="4.500" rx="1"/><path d="M10 11V9.500a2 2 0 0 1 4 0V11"/>',
  shieldCheck: '<path d="M12 3l7.500 3v5.500c0 4.500-3.200 7.800-7.500 9.500-4.300-1.700-7.500-5-7.500-9.500V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.500v7l6-3.500z"/>',
  books: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM16.500 5.500l3.500-1 3 15-3.500 1z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.500 2.700 3.700 5.700 3.700 9s-1.200 6.300-3.700 9c-2.500-2.700-3.700-5.700-3.700-9S9.500 5.700 12 3z"/>',
  cap: '<path d="M2 9.500L12 5l10 4.500-10 4.500z"/><path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500M22 9.500V15"/>',
  network: '<circle cx="12" cy="5.500" r="2.500"/><circle cx="5.500" cy="18" r="2.500"/><circle cx="18.500" cy="18" r="2.500"/><path d="M10.800 7.700L6.700 15.800M13.200 7.700l4.100 8.100M8 18h8"/>',
  trending: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  rocket: '<path d="M12 3c3.500 2 5.500 5.500 5.500 9.500L15 17H9l-2.500-4.500C6.500 8.500 8.500 5 12 3z"/><circle cx="12" cy="10" r="1.800"/><path d="M9 17l-1.500 4M15 17l1.500 4M6.500 12.500L4 15.500M17.500 12.500l2.500 3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  users: '<circle cx="9" cy="8.500" r="3.500"/><path d="M2.500 20c.500-3.500 3.200-5.500 6.500-5.500s6 2 6.500 5.500M16 5.200a3.500 3.500 0 0 1 0 6.600M18 14.800c2 .700 3.200 2.300 3.500 5.200"/>',
  briefcase: '<rect x="3" y="7.500" width="18" height="12.500" rx="2"/><path d="M9 7.500V5.500A1.500 1.500 0 0 1 10.500 4h3A1.500 1.500 0 0 1 15 5.500v2M3 13h18M10.500 13v1.500h3V13"/>',
  inbox: '<path d="M3 13l2.500-7.500h13L21 13M3 13v6h18v-6M3 13h5.500a3.500 3.500 0 0 0 7 0H21"/>',
};

const ICON_OF_SERVICE = {
  ponto: 'clock', holerite: 'receipt', 'plano-saude': 'heart', ferias: 'sun', 'abonos-legais': 'calendarCheck',
  'va-vr': 'card', wellhub: 'dumbbell', beneficios: 'gift', avaliacao: 'chart', vagas: 'briefcase',
  'auxilio-creche': 'smile', 'auxilio-idiomas': 'chat', 'auxilio-lente': 'glasses', 'day-off': 'coffee',
  reembolso: 'wallet', atestado: 'fileCross', zeev: 'listCheck', 'chamados-ti': 'wrench', acessos: 'key',
  equipamentos: 'laptop', facilities: 'building', juridico: 'scale',
  jira: 'kanban', confluence: 'fileText', drive: 'folder', agenda: 'calendar', slack: 'hash', gmail: 'mail',
  apresentacoes: 'presentation', deskbee: 'monitor', vpn: 'shieldLock',
  cursos: 'play', biblioteca: 'books', idiomas: 'globe', school: 'cap', conecta: 'network',
  'desenvolvimento-profissional': 'trending', knowbe4: 'shieldCheck', 'learning-rocks': 'rocket', pdi: 'target',
};

const ICON_OF_AREA = { Pessoas: 'users', Solicitações: 'inbox', Ferramentas: 'wrench', Aprendizagem: 'cap' };

/** `scale`: tamanho do símbolo; `cx`/`cy`: centro dele na capa. */
function cover({ width, height, tint, glyph, cx, cy, scale }) {
  const size = 24 * scale;
  const ring = (r, o) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#20242c"/><stop offset="1" stop-color="#0c0e12"/></linearGradient>
    <radialGradient id="glow" cx="${cx}" cy="${cy}" r="${size * 1.3}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${tint}" stop-opacity="0.26"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  ${ring(size * 0.95, 0.05)}
  ${ring(size * 0.65, 0.07)}
  <g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${scale})" fill="none" stroke="#f1f3f5" stroke-opacity="0.92" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[glyph]}</g>
</svg>
`;
}

mkdirSync('public/covers', { recursive: true });
let written = 0;
const write = (path, svg) => {
  writeFileSync(`public${path}`, svg);
  written++;
};

for (const category of catalog) {
  const area = AREAS[category.category];
  if (!area) continue;
  if (category.guideImage?.endsWith('.svg')) {
    write(category.guideImage, cover({ width: 1600, height: 900, tint: area.tint, glyph: ICON_OF_AREA[category.category], cx: 1000, cy: 450, scale: 14 }));
  }
  for (const item of category.items) {
    if (!item.image.endsWith('.svg')) continue;
    const glyph = ICON_OF_SERVICE[item.id];
    if (!glyph) {
      console.warn(`Sem símbolo para "${item.id}"; capa não gerada.`);
      continue;
    }
    write(item.image, cover({ width: 600, height: 600, tint: area.tint, glyph, cx: 300, cy: 300, scale: 8 }));
  }
}
console.log(`Capas geradas: ${written}.`);
