/* ============================================================
   Recorta a moldura vazia dos PNGs da marca.

   Os arquivos originais vêm num quadro 1080x1350 com a logo pequena no
   meio; usados assim, o <img> reserva o quadro inteiro e a logo fica
   minúscula dentro de uma caixa gigante. Aqui o alfa é lido, a caixa
   real da marca é medida e o arquivo é reescrito só com ela.

   Decodificação e codificação na mão porque o projeto não tem (e não
   precisa de) uma biblioteca de imagem: PNG de 8 bits RGBA é uma
   sequência de linhas filtradas dentro de um zlib, e as cinco filtragens
   são poucas linhas cada.

   Uso: node scripts/recortar-logo.mjs entrada.png saida.png
   ============================================================ */

import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";

const [, , entrada, saida] = process.argv;
if (!entrada || !saida) {
  console.error("uso: node scripts/recortar-logo.mjs <entrada.png> <saida.png>");
  process.exit(1);
}

const arq = readFileSync(entrada);

/* ---------- ler ---------- */

const largura = arq.readUInt32BE(16);
const altura = arq.readUInt32BE(20);
const profundidade = arq[24];
const cor = arq[25];

if (profundidade !== 8 || cor !== 6) {
  console.error(`só trato PNG RGBA de 8 bits (achei profundidade ${profundidade}, cor ${cor})`);
  process.exit(1);
}

let p = 8;
const pedacos = [];
while (p < arq.length) {
  const tam = arq.readUInt32BE(p);
  const tipo = arq.toString("ascii", p + 4, p + 8);
  if (tipo === "IDAT") pedacos.push(arq.subarray(p + 8, p + 8 + tam));
  p += 12 + tam;
}

const filtrado = zlib.inflateSync(Buffer.concat(pedacos));
const bpp = 4;
const linha = largura * bpp;
const pixels = Buffer.alloc(altura * linha);

/* desfaz os filtros linha a linha; cada um olha para o pixel à esquerda
   (a), o de cima (b) e o da diagonal (c) */
for (let y = 0; y < altura; y++) {
  const tipo = filtrado[y * (linha + 1)];
  const origem = y * (linha + 1) + 1;
  const destino = y * linha;
  const acima = destino - linha;

  for (let x = 0; x < linha; x++) {
    const bruto = filtrado[origem + x];
    const a = x >= bpp ? pixels[destino + x - bpp] : 0;
    const b = y > 0 ? pixels[acima + x] : 0;
    const c = y > 0 && x >= bpp ? pixels[acima + x - bpp] : 0;
    let valor;

    switch (tipo) {
      case 0:
        valor = bruto;
        break;
      case 1:
        valor = bruto + a;
        break;
      case 2:
        valor = bruto + b;
        break;
      case 3:
        valor = bruto + ((a + b) >> 1);
        break;
      case 4: {
        const pp = a + b - c;
        const pa = Math.abs(pp - a);
        const pb = Math.abs(pp - b);
        const pc = Math.abs(pp - c);
        valor = bruto + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        break;
      }
      default:
        console.error("filtro desconhecido", tipo);
        process.exit(1);
    }

    pixels[destino + x] = valor & 0xff;
  }
}

/* ---------- medir ---------- */

let x0 = largura;
let y0 = altura;
let x1 = -1;
let y1 = -1;

for (let y = 0; y < altura; y++) {
  for (let x = 0; x < largura; x++) {
    /* 8 de alfa e não 0: as bordas suavizadas deixam um halo quase
       invisível que, contado, devolveria o quadro inteiro */
    if (pixels[y * linha + x * bpp + 3] > 8) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}

if (x1 < 0) {
  console.error("imagem vazia");
  process.exit(1);
}

const larguraNova = x1 - x0 + 1;
const alturaNova = y1 - y0 + 1;

/* ---------- escrever ---------- */

const linhaNova = larguraNova * bpp;
const cru = Buffer.alloc(alturaNova * (linhaNova + 1));

for (let y = 0; y < alturaNova; y++) {
  cru[y * (linhaNova + 1)] = 0; /* sem filtro: o zlib já resolve */
  pixels.copy(
    cru,
    y * (linhaNova + 1) + 1,
    (y + y0) * linha + x0 * bpp,
    (y + y0) * linha + (x0 + larguraNova) * bpp,
  );
}

const crc32 = (() => {
  const tabela = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabela[n] = c;
  }
  return (buf) => {
    let c = -1;
    for (const b of buf) c = tabela[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

const pedaco = (tipo, dados) => {
  const cabeca = Buffer.alloc(8);
  cabeca.writeUInt32BE(dados.length, 0);
  cabeca.write(tipo, 4, "ascii");
  const fim = Buffer.alloc(4);
  fim.writeUInt32BE(crc32(Buffer.concat([Buffer.from(tipo, "ascii"), dados])), 0);
  return Buffer.concat([cabeca, dados, fim]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(larguraNova, 0);
ihdr.writeUInt32BE(alturaNova, 4);
ihdr[8] = 8;
ihdr[9] = 6;

writeFileSync(
  saida,
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pedaco("IHDR", ihdr),
    pedaco("IDAT", zlib.deflateSync(cru, { level: 9 })),
    pedaco("IEND", Buffer.alloc(0)),
  ]),
);

console.log(`${entrada} ${largura}x${altura} -> ${saida} ${larguraNova}x${alturaNova}`);
