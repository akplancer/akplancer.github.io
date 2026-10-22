// Builds the site's image assets from the raw Figma exports in _figma/.
// Exports are 2x renders; coordinates below are 1x Figma design px.
// Run: node scripts/build-assets.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAW = '_figma';
const OUT = 'src/assets';
const raw = (p) => path.join(RAW, p);

async function save(img, rel) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await img.png({ compressionLevel: 9 }).toFile(dest);
  console.log('wrote', rel);
}

const copy = (src, rel) => save(sharp(raw(src)), rel);
// crop in 2x pixels
const crop = (src, rel, x, y, w, h) => save(sharp(raw(src)).extract({ left: x, top: y, width: w, height: h }), rel);

// Compose layers (2x files) onto a transparent canvas covering design box [bx, by, bw, bh] (1x).
async function compose(rel, [bx, by, bw, bh], layers) {
  const W = bw * 2, H = bh * 2;
  const comps = [];
  for (const l of layers) {
    let img = l.svg ? sharp(Buffer.from(l.svg)) : sharp(raw(l.src));
    if (l.crop) img = img.extract({ left: l.crop[0], top: l.crop[1], width: l.crop[2], height: l.crop[3] });
    let buf = await img.png().toBuffer();
    let { width, height } = await sharp(buf).metadata();
    let left = Math.round((l.x - bx) * 2), top = Math.round((l.y - by) * 2);
    // clip to canvas
    const cl = Math.max(0, -left), ct = Math.max(0, -top);
    const cw = Math.min(width - cl, W - Math.max(left, 0)), ch = Math.min(height - ct, H - Math.max(top, 0));
    if (cw <= 0 || ch <= 0) continue;
    if (cl || ct || cw !== width || ch !== height) buf = await sharp(buf).extract({ left: cl, top: ct, width: cw, height: ch }).toBuffer();
    comps.push({ input: buf, left: Math.max(left, 0), top: Math.max(top, 0) });
  }
  await save(sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(comps), rel);
}

// ---------- Home (Portfolio- cover) ----------
await copy('cover/02_Untitled_Artwork 113 1.png', 'home/hero-tree.png');
await copy('cover/12_image 1.png', 'home/dog.png');
await crop('cover/04_Frame 1814109469.png', 'home/avatar.png', 0, 0, 134, 140);
await copy('cover/11_image 5201598.png', 'home/photo.png');
await copy('cover/00_Group 1410104746.png', 'home/grid-about.png');
await copy('cover/01_image 5201603.png', 'home/sky.png');
// dock icons (dock frame at 413,2418). The dock's blurred-green backdrop is baked into the export,
// so app icons get a rounded-square mask and the trash can gets the green keyed out.
async function dockIcon(rel, [x, y, w, h], radius) {
  let img = sharp(raw('cover/13_Frame 1814109461.png')).extract({ left: x, top: y, width: w, height: h });
  if (radius) {
    const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`);
    img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]);
  } else {
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const greenness = g - Math.max(r, b);
      if (greenness > 18) data[i + 3] = 0;
      else if (greenness > 8) data[i + 3] = Math.round(data[i + 3] * (18 - greenness) / 10);
    }
    img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  }
  await save(img, rel);
}
await dockIcon('home/dock-finder.png', [47, 28, 128, 128], 30);
await dockIcon('home/dock-referral.png', [224, 34, 128, 120], 22);
await dockIcon('home/dock-onboarding.png', [400, 34, 128, 120], 22);
await dockIcon('home/dock-filters.png', [576, 34, 128, 120], 22);
await dockIcon('home/dock-trash.png', [762, 26, 118, 136]);
// procreate
await copy('cover/21_image 5201618.png', 'home/faces-a.png');
await copy('cover/20_image 5201620.png', 'home/faces-b.png');
await copy('cover/41_image 5201659.png', 'home/disco.png');
await compose('home/jewel-nest.png', [694, 3345, 549, 477], [
  { src: 'cover/27_image 5201633.png', x: 694, y: 3451 },
  { src: 'cover/28_image 5201623.png', x: 897, y: 3345 },
  { src: 'cover/29_image 5201635.png', x: 860, y: 3538 },
  { src: 'cover/30_image 5201634.png', x: 825, y: 3446 },
]);
const art = {
  'art-1': 'cover/32_image 5201608.png', 'art-2': 'cover/33_image 5201604.png',
  'art-3': 'cover/34_image 5201606.png', 'art-4': 'cover/39_image 5201610.png',
  'art-5': 'cover/37_image 5201637.png', 'art-6': 'cover/38_image 5201639.png',
  'art-7': 'cover/35_image 5201614.png',
};
for (const [k, v] of Object.entries(art)) await copy(v, `home/${k}.png`);
// connect: hamster + matcha + bow + 🙏 (frame at 0,5116), and the Gmail logo
{
  // the crop catches the Gmail card's and Resume pill's edges; paint them back to the section pink
  const pink = (w, h) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#FFDDE4"/></svg>`);
  const base = await sharp(raw('cover/40_Frame 1814109471.png')).extract({ left: 800, top: 520, width: 820, height: 930 }).png().toBuffer();
  await save(sharp(base).composite([
    { input: pink(108, 254), left: 0, top: 180 },
    { input: pink(48, 150), left: 0, top: 696 },
  ]), 'home/hamster.png');
}
await crop('cover/40_Frame 1814109471.png', 'home/gmail.png', 640, 724, 222, 202);

// ---------- Case studies ----------
const grid = 'referral/01_Group 1410104746.png';
await copy(grid, 'case/grid.png');

// Referral — visuals group sits at (-1, 357)
const R752 = 'referral/05_Group 1410104752.png';
await compose('referral/hero.png', [40, 340, 1000, 640], [
  { src: R752, x: -1, y: 357, crop: [0, 0, 2560, 1300] },
  { src: 'referral/06_Group 1410104751.png', x: 689, y: 485 },
]);
await copy('referral/23_image 5201673.png', 'referral/palms-w.png');
await copy('referral/28_image 5201513.png', 'referral/challenges.png');
// Screens section (Figma re-export of 22 Oct 2026, _figma/referral2/): captioned frames are
// cropped below their caption; captions are set as live text in the page.
const R2 = (f) => `referral2/${f}`;
await crop(R2('31_Frame 1814111172.png'), 'referral/screen-landing.png', 0, 104, 539, 1105);
await crop(R2('32_Frame 1814111173.png'), 'referral/screen-how-it-works.png', 0, 96, 562, 1428);
await crop(R2('33_Frame 1814111174.png'), 'referral/screen-contacts-synced.png', 0, 112, 485, 1426);
await crop(R2('44_Frame 1814111176.png'), 'referral/screen-full-contacts.png', 0, 176, 560, 1106);
await crop(R2('05_Group 1410104752.png'), 'referral/screen-referred-progress.png', 1728, 10376, 488, 2059);
await copy(R2('41_image 5201683.png'), 'referral/screen-wallet.png');
await copy(R2('42_image 5201724.png'), 'referral/screen-manage-plans.png');
await copy(R2('43_image 5201726.png'), 'referral/screen-payment.png');
await copy(R2('40_Vector 7564.png'), 'referral/bracket.png');

// Onboarding
await compose('onboarding/hero.png', [40, 340, 1000, 640], [
  { src: 'onboarding/05_Group 1410104752.png', x: 104, y: 357 },
  { src: 'onboarding/17_image 5201676.png', x: 322, y: 592 },
  { src: 'onboarding/06_Group 1410104753.png', x: 500, y: 519 },
]);
await copy('onboarding/16_image 5201677.png', 'onboarding/challenges.png');
const onb = {
  'screen-splash': '40_image 5201684', 'screen-phone': '41_image 5201686',
  'screen-language': '42_image 5201688', 'screen-experience': '24_image 5201700',
  'screen-exit': '25_image 5201690', 'screen-buys-sells': '26_image 5201692',
  'screen-backtested': '27_image 5201694', 'screen-nse': '28_image 5201696',
  'screen-welcome': '29_image 5201698',
};
for (const [k, v] of Object.entries(onb)) await copy(`onboarding2/${v}.png`, `onboarding/${k}.png`);

// Filter & search — drops are 0-width strokes in Figma, redrawn here as SVG
const drops = [
  [536.8, 787.5, 2, 0], [559, 752, 2, 0], [631.8, 805.5, 2, 0], [654, 734, 2, 0], [615, 785, 2, 0], [628, 704, 2, 0],
  [575.39, 785.79, 7, -23.71], [597.59, 749.3, 7, 23.71], [641.73, 714.18, 7, 36.27], [663.93, 821.68, 7, -36.27],
  [622, 729, 7, 30.98], [547.2, 841.5, 7, -30.98], [575.04, 731.98, 7, 30.21], [600, 803.47, 2.64, -16.85],
  [637, 747, 7, -25.66], [622, 762, 7, 25.66], [601, 829, 7, -32.23], [597.13, 708.54, 7, 32.23],
];
const dx0 = 520, dy0 = 690;
const dropSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${170 * 2}" height="${170 * 2}" viewBox="0 0 170 170">${drops
  .map(([x, y, h, r]) => {
    const t = (-r * Math.PI) / 180;
    const x2 = x + h * Math.sin(-t), y2 = y + h * Math.cos(t);
    return `<line x1="${x - dx0}" y1="${y - dy0}" x2="${x2 - dx0}" y2="${y2 - dy0}" stroke="#d6d6d6" stroke-width="2.4" stroke-linecap="round"/>`;
  })
  .join('')}</svg>`;
await compose('filter/hero.png', [40, 340, 1080, 640], [
  { src: 'filter/04_image 5201672.png', x: 104, y: 357 },
  { src: 'filter/05_image 5201673.png', x: 74, y: 481 },
  { svg: dropSvg, x: dx0, y: dy0 },
  { src: 'filter/10_Group 1410105137.png', x: 731.75, y: 642.88 },
  { src: 'filter/09_Group 1410105136.png', x: 803.96, y: 659 },
  { src: 'filter/08_Group 1410105134.png', x: 832.42, y: 666.23 },
  { src: 'filter/07_Group 1410105132.png', x: 892.78, y: 681.98 },
  { src: 'filter/28_image 5201718.png', x: 559, y: 545 },
  { src: 'filter/06_image 5201716.png', x: 949, y: 582 },
]);
const fil = {
  'screen-all': '24_image 5201704', 'screen-investment': '25_image 5201708', 'screen-trading': '26_image 5201710',
  'filters-all': '27_Filters', 'filters-investment': '28_Filters-1', 'filters-trading': '29_Filters-2',
  'sort-sheet': '30_Bottom Navigation', bracket: '52_Vector 7564',
};
for (const [k, v] of Object.entries(fil)) await copy(`filter2/${v}.png`, `filter/${k}.png`);

// ---------- favicon + social preview (public/) ----------
await sharp(raw('cover/04_Frame 1814109469.png')).extract({ left: 0, top: 0, width: 134, height: 140 })
  .resize(180, 180, { fit: 'cover' }).png().toFile('public/favicon.png');
await sharp(raw('cover/02_Untitled_Artwork 113 1.png')).resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82 }).toFile('public/og.jpg');
console.log('wrote public/favicon.png, public/og.jpg');
