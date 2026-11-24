// Prepara as imagens de public/images/ para o app: WebP leve em public/covers/, mantendo a PROPORÇÃO ORIGINAL.
// O recorte (pôster vertical 2:3 nos cards, faixa larga no banner) é feito pelo CSS, então tanto fotos
// verticais quanto horizontais funcionam. Os originais não são alterados.
// Só processa o que é novo ou mudou desde a última vez.
//
// Uso:  node scripts/optimize-images.mjs [--inset=0.055] [--force] [arquivo ...]
//   --inset  fração a tirar de cada lado (largura e altura) para remover uma moldura (padrão 0, para fotos).
//            As ilustrações antigas com moldura escura usavam 0.055.
//   --force  reprocessa mesmo as imagens que já têm capa atualizada.
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'public/images';
const TARGET = 'public/covers';
const MAX_SIDE = 1280; // maior lado da capa; nunca amplia

const args = process.argv.slice(2);
const insetArg = args.find((a) => a.startsWith('--inset='));
const inset = insetArg ? Number(insetArg.split('=')[1]) : 0;
const force = args.includes('--force');
const requested = args.filter((a) => !a.startsWith('--'));

if (!Number.isFinite(inset) || inset < 0 || inset >= 0.4) {
  console.error('--inset deve estar entre 0 e 0.4');
  process.exit(1);
}

// Nome de saída seguro para URL: minúsculas, sem acento, só letras/números/_ (ex.: "Férias" -> "ferias").
const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

mkdirSync(TARGET, { recursive: true });
const files = (requested.length ? requested : readdirSync(SOURCE)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

if (files.length === 0) console.log(`Nenhuma imagem encontrada em ${SOURCE}/.`);

let done = 0;
let skipped = 0;
for (const file of files) {
  const input = existsSync(file) ? file : join(SOURCE, file);
  const output = join(TARGET, `${slug(basename(file, extname(file)))}.webp`);

  if (!force && existsSync(output) && statSync(output).mtimeMs >= statSync(input).mtimeMs) {
    skipped++;
    continue;
  }

  const { width = 0, height = 0 } = await sharp(input).rotate().metadata();
  const cropW = Math.round(width * (1 - 2 * inset));
  const cropH = Math.round(height * (1 - 2 * inset));

  await sharp(input)
    .rotate() // respeita a orientação gravada pela câmera (fotos de celular)
    .extract({ left: Math.round((width - cropW) / 2), top: Math.round((height - cropH) / 2), width: cropW, height: cropH })
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  console.log(`${file} -> ${output}`);
  done++;
}
console.log(`Prontas: ${done}. Já atualizadas (puladas): ${skipped}.`);
