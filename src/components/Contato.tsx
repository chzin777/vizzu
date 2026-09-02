"use client";

/* ============================================================
   CONTATO

   O único bloco laranja cheio da página, e o último. Tipo preto por
   cima — é o par da logo e é o que passa em contraste.

   Sem formulário: o cliente dele vive no Instagram, e um formulário
   que cai numa caixa de e-mail sem resposta é pior que nenhum.
   ============================================================ */

import { useRef } from "react";
import { useGSAP, revelar } from "../lib/anim";
import { MARCA } from "../dados";

export default function Contato() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(() => revelar(raiz.current), { scope: raiz });

  return (
    <section className="contato" id="contato" ref={raiz}>
      {/* a marca no fundo, gigante: era a palavra escrita, agora é a
          própria logo, pintada por máscara para herdar a cor da seção */}
      <span className="contato-fundo" aria-hidden="true" />

      <div className="contato-grade">
        <div>
          <p className="clipe mono sobe" style={{ marginBottom: 22 }}>
            00:02:02:08 · Falar comigo
          </p>
          <h2 className="contato-titulo display sobe">
            Sua marca está sendo ignorada?
          </h2>
        </div>

        <div>
          <p className="contato-lead sobe">
            Me manda o que você tem hoje: o perfil, o vídeo que não rendeu, a
            logo que não fecha. Eu digo o que dá para resolver, o prazo e o
            preço antes de você se comprometer com qualquer coisa.
          </p>

          <div className="contato-acoes sobe" style={{ marginTop: 26 }}>
            <a
              className="botao"
              href={MARCA.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Chamar no WhatsApp
            </a>
            {/* o trabalho está aqui mesmo: mandar para o portfólio antigo
                era tirar a pessoa do site na hora de decidir */}
            <a className="botao botao-vazado" href="#trabalho">
              Ver o trabalho antes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
