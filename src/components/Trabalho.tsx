"use client";

/* ============================================================
   TRABALHO

   O cabeçalho da seção e o Magic Bento. Cada cartão do bento é um link
   para a página do projeto, que veste as cores e a tipografia daquela
   marca — por isso é link e não botão: navegação de verdade, com
   endereço próprio e possibilidade de compartilhar.

   As capas e as peças são arquivos deste repositório, baixados uma vez
   por `scripts/baixar-portfolio.mjs`. Nada aqui depende do Wix no ar.
   ============================================================ */

import { useRef } from "react";
import { useGSAP, revelar } from "../lib/anim";
import MagicBento from "./MagicBento";

export default function Trabalho() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(() => revelar(raiz.current), { scope: raiz });

  return (
    <section className="trabalho" id="trabalho" ref={raiz}>
      <div className="secao-topo">
        <div>
          <p className="clipe mono sobe" style={{ marginBottom: 20 }}>
            00:00:12:04 · Trabalho
          </p>
          <h2 className="secao-titulo display sobe">
            O corte fala <span className="serifa laranja">melhor</span> que eu
          </h2>
        </div>
        <p className="secao-nota sobe">
          Seis projetos, do vídeo à marca inteira. Cada um abre numa página
          vestida com as cores e a tipografia daquela marca.
        </p>
      </div>

      <MagicBento
        textAutoHide
        enableStars
        enableSpotlight
        enableBorderGlow
        enableTilt={false}
        enableMagnetism={false}
        clickEffect
        spotlightRadius={400}
        particleCount={12}
        glowColor="245, 124, 31"
        disableAnimations={false}
      />
    </section>
  );
}
