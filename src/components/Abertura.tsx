"use client";

/* ============================================================
   ABERTURA

   Mesma mecânica da abertura do site que serviu de referência: tela
   cheia na cor da marca, símbolo no centro, um ponto orbitando em volta
   e, no fim, um CÍRCULO LARANJA que cresce do centro, toma a tela e
   entrega a página.

   O fundo é branco, ao contrário do resto da página: a logo é laranja
   com transparência, e o corte de branco para preto é a mesma virada
   que a página faz entre as seções.
   ============================================================ */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP, semMovimento, pausarRolagem } from "../lib/anim";
import { MARCA } from "../dados";

const DURACAO = 1.9; /* segundos até começar a sair */

/* A abertura é a ENTRADA NO SITE, não uma transição de rota. Voltar de
   uma página de projeto para a home remonta este componente, e sem uma
   marca a barra de carregamento apareceria de novo a cada volta — do
   lado de quem navega, isso lê como o site recarregando sozinho.

   A marca é uma VARIÁVEL DE MÓDULO, não sessionStorage: ela morre junto
   com o carregamento da página. Recarregar mostra a abertura de novo,
   que é o certo — só a navegação por dentro do site pula. Guardar isso
   na aba fazia a abertura sumir para sempre depois da primeira vez. */
let jaRodou = false;

export default function Abertura() {
  const raiz = useRef<HTMLDivElement>(null);
  /* A decisão NÃO pode sair do primeiro render: o servidor não enxerga
     o sessionStorage, e ler ali fazia o HTML do servidor e o do cliente
     saírem diferentes — era o erro de hidratação. Ela sai de um efeito
     de layout, que roda antes da pintura: quem já viu a abertura não
     chega a ver um quadro dela. */
  const [pular, setPular] = useState(false);

  const [saindo, setSaindo] = useState(false);
  const [fora, setFora] = useState(false);
  const [porcento, setPorcento] = useState(0);

  useLayoutEffect(() => {
    if (jaRodou) {
      setPular(true);
      setFora(true);
      return;
    }
    jaRodou = true;
  }, []);

  /* O fechamento tem relógio próprio, e NÃO o `onComplete` da timeline.
     No StrictMode a timeline nasce, a limpeza do useGSAP a mata, e a
     segunda montagem cairia num guarda: nenhuma chegaria ao fim. Uma
     cortina precisa sair mesmo que a animação falhe. */
  useEffect(() => {
    if (pular) return;
    if (semMovimento()) {
      setFora(true);
      return;
    }
    const t = setTimeout(() => setSaindo(true), DURACAO * 1000);
    return () => clearTimeout(t);
  }, [pular]);

  /* Rolagem travada enquanto a cortina está na tela. São duas travas e
     as duas são necessárias: `pausarRolagem` para o Lenis, que ignora
     `overflow: hidden` por aplicar a posição via script; e a classe no
     <html> para o que o Lenis não cobre — toque, teclado e a barra de
     rolagem arrastada. O Lenis nasce junto com esta cortina, então a
     tentativa se repete por alguns quadros até a instância existir. */
  useEffect(() => {
    if (pular || semMovimento() || saindo) return;
    const html = document.documentElement;
    html.classList.add("travado");

    let tentativas = 0;
    const insistir = setInterval(() => {
      if (pausarRolagem(true) || ++tentativas > 40) clearInterval(insistir);
    }, 50);

    const comer = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", comer, { passive: false });
    window.addEventListener("touchmove", comer, { passive: false });

    const barrar = (e: KeyboardEvent) => {
      const teclas = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (teclas.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", barrar, { passive: false });

    return () => {
      clearInterval(insistir);
      html.classList.remove("travado");
      pausarRolagem(false);
      window.removeEventListener("wheel", comer);
      window.removeEventListener("touchmove", comer);
      window.removeEventListener("keydown", barrar);
    };
  }, [pular, saindo]);

  useGSAP(
    () => {
      /* Sem guarda de "já tocou": no StrictMode a primeira montagem cria
         a timeline, a limpeza do useGSAP a mata, e uma guarda faria a
         segunda desistir — a barra ficava parada em 0%. */
      if (pular || semMovimento()) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".ab-nucleo", {
          scale: 0.9,
          autoAlpha: 0,
          duration: 0.55,
        })
        /* A barra e o número saem do MESMO tween: dois relógios separados
           terminariam em quadros diferentes, e um "98%" parado ao lado de
           uma barra cheia faz a abertura parecer quebrada. */
        .to(
          { v: 0 },
          {
            v: 1,
            duration: DURACAO - 0.35,
            ease: "power1.inOut",
            onUpdate() {
              const v = (this.targets()[0] as { v: number }).v;
              gsap.set(".ab-barra i", { scaleX: v });
              setPorcento(Math.round(v * 100));
            },
          },
          0.1,
        );
    },
    { scope: raiz },
  );

  /* A saída: o conteúdo apaga e o buraco abre por cima. Liberar a
     rolagem no COMEÇO da saída é de propósito — ficar preso olhando a
     página já visível é pior que rolar cedo. */
  useEffect(() => {
    if (!saindo) return;
    const el = raiz.current;
    if (!el) return;

    const tl = gsap.timeline({ onComplete: () => setFora(true) });
    /* Duas etapas: o círculo laranja cresce do centro e engole a tela
       branca; depois a cortina inteira apaga e a página aparece. O
       laranja no meio é o que dá a batida de marca na virada — sem ele
       o branco ia direto para o preto e a troca passava despercebida. */
    tl.to(".ab-nucleo", { autoAlpha: 0, scale: 0.94, duration: 0.26, ease: "power2.in" })
      .fromTo(
        ".ab-disco",
        { width: 0, height: 0, autoAlpha: 1 },
        { width: "260vmax", height: "260vmax", duration: 0.75, ease: "power3.inOut" },
        0.08,
      )
      .to(el, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, ">-0.05")
      .set(el, { pointerEvents: "none" });

    return () => {
      tl.kill();
    };
  }, [saindo]);

  if (fora || pular) return null;

  return (
    <div
      className={`abertura${saindo ? " saindo" : ""}`}
      ref={raiz}
      role="status"
      aria-label={`Carregando o site da ${MARCA.nome}`}
    >
      <div className="ab-nucleo">
        <div className="ab-palco">
          {/* o anel é só a pista: fica quase invisível e existe para o
              ponto ter por onde andar */}
          <span className="ab-anel" aria-hidden="true" />
          <span className="ab-orbita" aria-hidden="true">
            <span className="ab-ponto" />
          </span>

          {/* a MESMA logo do menu, pintada por máscara: o símbolo
              sozinho não é a marca que a pessoa vê no resto do site */}
          <span className="ab-marca" role="img" aria-label={MARCA.nome} />
        </div>

        <div className="ab-carga">
          <div className="ab-barra" aria-hidden="true">
            <i />
          </div>
          <p
            className="ab-porcento mono"
            role="progressbar"
            aria-valuenow={porcento}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Carregando"
          >
            {String(porcento).padStart(3, "0")}%
          </p>
        </div>
      </div>

      <span className="ab-disco" aria-hidden="true" />

      <button className="ab-pular mono" type="button" onClick={() => setSaindo(true)}>
        Pular
      </button>
    </div>
  );
}
