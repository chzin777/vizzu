"use client";

/* ============================================================
   PROCESSO — a linha do tempo

   A seção era uma lista parada. Agora ela é o que o assunto pede: uma
   TIMELINE. Um playhead desce pela trilha conforme a página rola, e o
   passo por onde ele está passando acende — número, título e texto.

   A rolagem manda, não um relógio: quem lê rápido vê a linha correr,
   quem lê devagar vê ela esperar. É a mesma ideia da barra do topo da
   página, aplicada dentro de uma seção só.

   O ponteiro também manda: passar o mouse por um passo o acende sem
   esperar a rolagem chegar lá. Sem ponteiro, a rolagem dá conta
   sozinha.
   ============================================================ */

import { useRef, useState } from "react";
import { gsap, useGSAP, revelar, semMovimento, ScrollTrigger } from "../lib/anim";
import { PASSOS } from "../dados";

export default function Processo() {
  const raiz = useRef<HTMLElement>(null);
  const trilha = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  /* enquanto o ponteiro manda, a rolagem para de mandar */
  const preso = useRef(false);

  useGSAP(
    () => {
      revelar(raiz.current);

      if (semMovimento()) return;

      /* A fita cresce com a rolagem. `scaleY` e não `height`: altura
         força recálculo de layout a cada quadro, escala é só
         composição. */
      gsap.fromTo(
        ".pr-fita",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: trilha.current,
            start: "top 62%",
            end: "bottom 80%",
            scrub: 0.5,
            onUpdate: (self) => {
              if (preso.current) return;
              const i = Math.min(
                PASSOS.length - 1,
                Math.floor(self.progress * PASSOS.length + 0.15),
              );
              setAtivo(i);
            },
          },
        },
      );

      ScrollTrigger.refresh();
    },
    { scope: raiz },
  );

  return (
    <section className="processo claro" id="processo" ref={raiz}>
      <div className="secao-topo">
        <div>
          <p className="clipe mono sobe" style={{ marginBottom: 20 }}>
            00:01:30:08 · Como funciona
          </p>
          <h2 className="secao-titulo display sobe">
            Do primeiro oi ao arquivo na sua mão
          </h2>
        </div>
        <p className="secao-nota sobe">
          Sem briefing de dez páginas e sem sumir por duas semanas. Você sabe
          em que passo o projeto está o tempo todo.
        </p>
      </div>

      <div className="pr-trilha" ref={trilha}>
        {/* o trilho apagado e, por cima, a fita que a rolagem preenche */}
        <span className="pr-trilho" aria-hidden="true">
          <span className="pr-fita" />
        </span>

        {PASSOS.map((p, i) => (
          <article
            /* `sobe` entrega a entrada ao mesmo mecanismo do resto da
               página. Um `gsap.from` próprio escondia os passos e, com a
               seção já passada, nunca os trazia de volta. */
            className={`pr-passo sobe${i === ativo ? " ativo" : ""}`}
            key={p.tc}
            onPointerEnter={() => {
              preso.current = true;
              setAtivo(i);
            }}
            onPointerLeave={() => {
              preso.current = false;
            }}
          >
            <span className="pr-marca" aria-hidden="true" />

            <p className="pr-tc mono">
              {p.tc} · Passo {String(i + 1).padStart(2, "0")}
            </p>

            <h3 className="pr-nome display">{p.nome}</h3>

            <p className="pr-desc">{p.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
