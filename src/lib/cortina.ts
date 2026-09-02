"use client";

/* ============================================================
   CORTINA DE TROCA DE PÁGINA

   É o mesmo gesto do fim da abertura do site — um disco de cor que
   cresce do centro e engole a tela —, só que disparado ao clicar num
   trabalho, e na cor daquele projeto.

   O disco nasce no PONTO DO CLIQUE, não no centro da tela: a cor sai
   de onde a mão estava, então a troca parece consequência do clique.

   O elemento é pendurado no <body>, fora da árvore do React, porque
   ele precisa sobreviver à navegação: a página antiga desmonta no meio
   da animação, e um nó do React iria junto. Quem apaga é o relógio
   dele mesmo — cortina que depende do destino montar fica na tela para
   sempre quando a rota falha.
   ============================================================ */

import { gsap } from "gsap";
import { useRouter } from "next/navigation";

const CRESCER = 0.4; /* segundos até cobrir a tela */

/* preto ou branco por cima da cor da cortina, pelo brilho dela: o
   símbolo branco some no amarelo do Tatuzinho, o preto some no
   vermelho da loja de motos. */
function sobre(cor: string) {
  const hex = cor.replace("#", "").trim();
  if (hex.length < 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luz = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luz > 0.62 ? "#0a0a0a" : "#ffffff";
}
const VIDA = 1500; /* teto de vida do nó, em milissegundos */

export function cortinar(cor: string, x: number, y: number): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  /* duas cortinas ao mesmo tempo seriam duas cores brigando */
  document.querySelectorAll(".cortina-troca").forEach((n) => n.remove());

  const disco = document.createElement("span");
  disco.className = "cortina-troca";
  disco.style.background = cor;
  disco.style.left = `${x}px`;
  disco.style.top = `${y}px`;
  document.body.appendChild(disco);

  /* o símbolo da casa aparece dentro do disco, no centro da tela: é o
     que transforma a cortina em marca em vez de um flash de cor. Ele é
     um nó separado porque o disco cresce a partir do clique — dentro
     dele, a logo cresceria junto e chegaria deformada. */
  const marca = document.createElement("span");
  marca.className = "cortina-marca";
  marca.style.background = sobre(cor);
  document.body.appendChild(marca);

  const morrer = window.setTimeout(() => {
    disco.remove();
    marca.remove();
  }, VIDA);

  gsap.fromTo(
    marca,
    { autoAlpha: 0, scale: 0.82 },
    { autoAlpha: 1, scale: 1, duration: CRESCER * 0.8, ease: "power3.out", delay: CRESCER * 0.3 },
  );

  return new Promise((resolver) => {
    gsap.fromTo(
      disco,
      { width: 0, height: 0 },
      {
        width: "260vmax",
        height: "260vmax",
        duration: CRESCER,
        ease: "power3.inOut",
        onComplete: () => {
          window.clearTimeout(morrer);
          /* some sozinho depois que a página de destino já pintou a
             própria cortina por cima, na mesma cor */
          window.setTimeout(() => {
            disco.remove();
            marca.remove();
          }, 380);
          resolver();
        },
      },
    );
  });
}

/* O mesmo gesto para QUALQUER link interno: sair de um projeto para a
   home, ou pular para o próximo projeto. A cor sai da variável de
   acento do próprio elemento clicado, então dentro de um projeto a
   cortina já nasce vestida com o tema daquela marca. */
export function useCortina() {
  const router = useRouter();

  return (e: React.MouseEvent<HTMLAnchorElement>, destino: string, corFixa?: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    /* Sem cor declarada, a cortina veste o acento do lugar clicado. Com
       cor declarada, ela veste o DESTINO — voltar para a home é sempre
       o laranja da casa, mesmo saindo de um projeto azul. */
    const cor =
      corFixa ||
      getComputedStyle(e.currentTarget).getPropertyValue("--laranja").trim() ||
      "#f57c1f";
    router.prefetch(destino);
    cortinar(cor, e.clientX, e.clientY).then(() => router.push(destino));
  };
}
