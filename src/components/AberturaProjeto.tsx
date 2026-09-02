"use client";

/* ============================================================
   ABERTURA DO PROJETO

   A mesma virada da abertura do site — a cor tomando a tela inteira e
   depois abrindo —, só que na cor da marca do projeto: vermelho na
   loja de motos, azul na construtora, amarelo na de automóveis.

   Aqui ela roda ao CONTRÁRIO da abertura do site. Lá o disco cresce e
   entrega a página; aqui a cor já está cobrindo tudo quando a página
   monta e se fecha num ponto no centro, drenando para revelar o
   projeto. É o que faz a troca de página parecer um corte, e não um
   carregamento.

   A cortina é pintada no primeiro quadro (vem no HTML do servidor),
   senão apareceria depois da página e viraria um piscar.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { gsap, semMovimento } from "../lib/anim";

export default function AberturaProjeto({ cor }: { cor: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [fora, setFora] = useState(false);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (semMovimento()) {
      setFora(true);
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setFora(true) });
    /* A cor recolhe para um ponto no centro: o recorte circular vai de
       maior que a tela até zero. Animar opacidade no lugar disso daria
       um dissolve de banner, sem a batida do corte. */
    tl.fromTo(
      el,
      { clipPath: "circle(150% at 50% 50%)" },
      { clipPath: "circle(0% at 50% 50%)", duration: 0.52, ease: "power3.inOut" },
      0.06,
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (fora) return null;

  return (
    <div
      className="ab-projeto"
      ref={raiz}
      aria-hidden="true"
      style={{ background: cor }}
    />
  );
}
