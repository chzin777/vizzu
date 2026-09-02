"use client";

/* ============================================================
   SERVIÇOS — as trilhas

   Três linhas cheias, não três cards. As áreas não são planos que a
   pessoa compara e escolhe um: são partes de um mesmo trabalho, e a
   linha empilhada diz isso melhor que a coluna.
   ============================================================ */

import { useRef } from "react";
import { useGSAP, revelar, gsap, semMovimento } from "../lib/anim";
import { AREAS, MARCA } from "../dados";

export default function Servicos() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revelar(raiz.current);
      if (semMovimento()) return;

      /* No celular não existe ponteiro, e a cortina laranja de cada
         trilha — que é o que dá vida à seção — nunca acontecia. Aqui ela
         acende sozinha: a trilha que estiver cruzando o meio da tela
         ganha a mesma classe que o hover daria, e apaga ao sair.

         Só abaixo de 900px: no desktop quem manda continua sendo o
         ponteiro, senão as duas coisas brigariam pela mesma cortina. */
      if (window.matchMedia("(min-width: 900px)").matches) return;

      gsap.utils.toArray<HTMLElement>(".trilha", raiz.current).forEach((trilha) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: trilha,
            start: "top 72%",
            end: "bottom 42%",
            onEnter: () => trilha.classList.add("acesa"),
            onEnterBack: () => trilha.classList.add("acesa"),
            onLeave: () => trilha.classList.remove("acesa"),
            onLeaveBack: () => trilha.classList.remove("acesa"),
          },
        });
      });
    },
    { scope: raiz },
  );

  return (
    <section className="servicos" id="servicos" ref={raiz}>
      <div className="secao-topo">
        <div>
          <p className="clipe mono sobe" style={{ marginBottom: 20 }}>
            00:01:02:10 · O que eu faço
          </p>
          <h2 className="secao-titulo display sobe">
            Três frentes, <span className="serifa laranja">um</span> resultado
          </h2>
        </div>
        <p className="secao-nota sobe">
          Dá para contratar uma só. A maioria fecha as três porque o vídeo, a
          marca e o feed precisam falar igual. Senão o cliente vê três marcas
          diferentes no mesmo perfil.
        </p>
      </div>

      <div className="trilhas">
        {AREAS.map((a) => (
          <a
            className="trilha sobe"
            key={a.tc}
            href={MARCA.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            <div className="trilha-linha">
              <span className="trilha-num mono">{a.tc}</span>
              <h3 className="trilha-nome display">{a.nome}</h3>
              <p className="trilha-desc">{a.desc}</p>
              <div className="trilha-tags">
                {a.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
