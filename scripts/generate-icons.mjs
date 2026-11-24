// Gera ícones PWA (PNG) sem dependências externas: fundo escuro + disco laranja.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

function png(size, discRatio) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const r = size * discRatio;
  const mid = size / 2;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const inside = (x - mid) ** 2 + (y - mid) ** 2 <= r * r;
      const o = y * (size * 4 + 1) + 1 + x * 4;
      [raw[o], raw[o + 1], raw[o + 2], raw[o + 3]] = inside ? [255, 85, 0, 255] : [14, 17, 22, 255];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync('public/icons/icon-192.png', png(192, 0.34));
writeFileSync('public/icons/icon-512.png', png(512, 0.34));
// "maskable" exige conteúdo dentro da zona segura central (~80%).
writeFileSync('public/icons/icon-maskable-512.png', png(512, 0.26));
writeFileSync(
  'public/icons/icon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0e1116"/><circle cx="32" cy="32" r="18" fill="#ff5500"/></svg>\n`,
);
console.log('Ícones gerados.');
