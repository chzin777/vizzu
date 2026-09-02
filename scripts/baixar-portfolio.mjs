/* ============================================================
   Traz as peças do portfólio do Wix para dentro do repositório.

   Roda uma vez (`node scripts/baixar-portfolio.mjs`) e grava tudo em
   public/trabalho/<projeto>/. Depois disso o site não depende mais do
   Wix: as imagens e os vídeos são arquivos daqui.

   O Wix guarda a lista de peças de cada projeto num JSON embutido na
   página, sob a chave `wixSDKItems`. Cada item é ou uma imagem
   (`wix:image://v1/<arquivo>/...#originWidth=..`) ou um vídeo
   (`wix:video://v1/<id>/_#posterUri=<capa>.jpg`).
   ============================================================ */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE =
  "https://noahqueiroz91.wixsite.com/portfolio-criativo/portfolio-collections/my-portfolio";

const PROJETOS = [
  { n: 1, slug: "motos-e-motos" },
  { n: 2, slug: "citrine" },
  { n: 3, slug: "vega-construtora" },
  { n: 4, slug: "corpo-e-cidade" },
  { n: 5, slug: "fluid-no-label" },
  { n: 6, slug: "tatuzinho" },
];

const AGENTE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const RAIZ = path.join(process.cwd(), "public", "trabalho");

async function baixar(url, destino) {
  if (existsSync(destino)) return { ok: true, pulado: true };
  const r = await fetch(url, { headers: { "user-agent": AGENTE } });
  if (!r.ok) return { ok: false, status: r.status };
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(destino, buf);
  return { ok: true, bytes: buf.length };
}

/** Todos os `wixSDKItems` da página, na ordem em que aparecem. */
function extrairItens(html) {
  const itens = [];
  const vistos = new Set();
  const re = /"wixSDKItems":\[(.*?)\],"itemsSrc"/gs;

  for (const bloco of html.matchAll(re)) {
    const corpo = bloco[1];

    for (const m of corpo.matchAll(
      /"type":"image"[^{]*?"src":"wix:image:\\?\/\\?\/v1\\?\/([^\\"#]+)[^"]*?#originWidth=(\d+)&originHeight=(\d+)/g,
    )) {
      const arquivo = m[1].split("/").pop();
      if (vistos.has(arquivo)) continue;
      vistos.add(arquivo);
      itens.push({
        tipo: "imagem",
        arquivo,
        largura: Number(m[2]),
        altura: Number(m[3]),
      });
    }

    for (const m of corpo.matchAll(
      /"type":"video".*?"src":"wix:video:\\?\/\\?\/v1\\?\/([^\\"/]+)\\?\/_#posterUri=([^&"]+)&posterWidth=(\d+)&posterHeight=(\d+)/g,
    )) {
      const id = m[1];
      if (vistos.has(id)) continue;
      vistos.add(id);
      itens.push({
        tipo: "video",
        id,
        capa: m[2],
        largura: Number(m[3]),
        altura: Number(m[4]),
      });
    }
  }

  return itens;
}

function titulo(html) {
  const m = html.match(/<title>([^<]*)<\/title>/);
  if (!m) return "";
  return m[1].replace(/\s*\|\s*Portfolio Criativo\s*$/, "").replace(/&amp;/g, "&");
}

const resumo = [];

for (const p of PROJETOS) {
  const url = `${BASE}/project-title-${p.n}`;
  const pasta = path.join(RAIZ, p.slug);
  await mkdir(pasta, { recursive: true });

  const cacheDir = path.join(process.cwd(), ".cache-portfolio");
  await mkdir(cacheDir, { recursive: true });
  const cache = path.join(cacheDir, `${p.slug}.html`);
  let html;
  if (existsSync(cache)) {
    html = await readFile(cache, "utf8");
  } else {
    const r = await fetch(url, { headers: { "user-agent": AGENTE } });
    html = await r.text();
    await writeFile(cache, html);
  }

  const itens = extrairItens(html);
  const pecas = [];

  for (const [i, item] of itens.entries()) {
    const ordem = String(i + 1).padStart(2, "0");

    if (item.tipo === "imagem") {
      const ext = path.extname(item.arquivo) || ".jpg";
      const nome = `${ordem}${ext}`;
      /* sem /v1/fill: o caminho cru devolve o arquivo original */
      const r = await baixar(
        `https://static.wixstatic.com/media/${item.arquivo}`,
        path.join(pasta, nome),
      );
      if (!r.ok) {
        console.log(`  falhou imagem ${item.arquivo} (${r.status})`);
        continue;
      }
      pecas.push({
        tipo: "imagem",
        src: `/trabalho/${p.slug}/${nome}`,
        largura: item.largura,
        altura: item.altura,
      });
    } else {
      const nome = `${ordem}.mp4`;
      const capa = `${ordem}-capa.jpg`;
      let baixou = false;

      for (const q of ["720p", "480p", "360p"]) {
        const r = await baixar(
          `https://video.wixstatic.com/video/${item.id}/${q}/mp4/file.mp4`,
          path.join(pasta, nome),
        );
        if (r.ok) {
          baixou = true;
          break;
        }
      }
      if (!baixou) {
        console.log(`  falhou vídeo ${item.id}`);
        continue;
      }

      await baixar(
        `https://static.wixstatic.com/media/${item.capa}`,
        path.join(pasta, capa),
      );

      pecas.push({
        tipo: "video",
        src: `/trabalho/${p.slug}/${nome}`,
        capa: `/trabalho/${p.slug}/${capa}`,
        largura: item.largura,
        altura: item.altura,
      });
    }
  }

  console.log(`${p.slug}: ${pecas.length} peças`);
  resumo.push({ slug: p.slug, titulo: titulo(html), pecas });
}

await writeFile(
  path.join(process.cwd(), "src", "portfolio.json"),
  JSON.stringify(resumo, null, 2),
);
console.log("src/portfolio.json escrito");
