"use client";

/* ============================================================
   A CAPA — divisão

   Metade chapada, metade cena. É a estrutura da capa do DAPS, e ela
   resolve o mesmo problema aqui: texto sobre cor plana lê sempre, e a
   marca aparece dentro de uma cena real em vez de recortada boiando no
   vazio.

   No lugar do produto, o símbolo da Vizzu. No lugar do gelo, um shader:
   dobras de tecido em movimento lento na cor da marca, cobrindo a capa
   inteira. Nada de arquivo de imagem — nunca se repete e pesa alguns
   kilobytes.

   Duas camadas em profundidades diferentes: o tecido quase não anda, o
   símbolo anda médio. A diferença entre os planos é o que o olho lê
   como espaço.

   Cada camada tem um invólucro que POSICIONA e um filho que ANIMA. Sem
   essa separação, `translate` do CSS e `transform` do GSAP disputam o
   mesmo atributo e o símbolo sai do centro.
   ============================================================ */

import { useRef } from "react";
import { gsap, useGSAP, semMovimento } from "../lib/anim";
import { MARCA, ESPIRAL_CAPA } from "../dados";
import dynamic from "next/dynamic";
import InfiniteSpiral from "./InfiniteSpiral";

/* O tecido é WebGL: só existe no cliente. */
const Silk = dynamic(() => import("./Silk"), { ssr: false });

export default function Capa() {
  const raiz = useRef<HTMLElement>(null);
  const tocou = useRef(false);

  useGSAP(
    () => {
      if (semMovimento()) return;

      /* A ENTRADA é o que não pode rodar duas vezes: no StrictMode o
         React monta, limpa e monta de novo, e uma timeline órfã da
         primeira montagem escreveria opacidade em cima do estado final.
         O guarda protege só ela — o paralaxe fica fora, senão a segunda
         montagem sairia sem nenhum ouvinte. */
      if (!tocou.current) {
        tocou.current = true;
        gsap
          .timeline({ delay: 0.15, defaults: { ease: "power4.out" } })
          .from(".cp-rot", { y: 14, autoAlpha: 0, duration: 0.7 }, 0.1)
          .from(".cp-linha > span", { yPercent: 112, duration: 1, stagger: 0.09 }, 0.15)
          .from(
            ".cp-sub, .cp-acoes",
            { y: 18, autoAlpha: 0, duration: 0.75, stagger: 0.08 },
            0.5,
          )
          .from(".cn-camada", { autoAlpha: 0, scale: 1.06, duration: 1.1, stagger: 0.08 }, 0.2);
      }

      const camadas = gsap.utils.toArray<HTMLElement>(".cn-camada", raiz.current).map((el) => ({
        el,
        mov: Number(el.dataset.mov),
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.3, ease: "power3.out" }),
      }));

      /* A coluna de texto anda MENOS que a cena. Texto que acompanha o
         ponteiro na mesma medida da imagem cansa de ler; o movimento
         aqui existe só para as duas metades não parecerem coladas em
         planos diferentes. */
      const colX = gsap.quickTo(".cp-texto", "x", { duration: 1.2, ease: "power3.out" });
      const colY = gsap.quickTo(".cp-texto", "y", { duration: 1.4, ease: "power3.out" });

      /* A espiral tem DOIS transforms em elementos diferentes: a rolagem
         anda no invólucro, o ponteiro anda aqui dentro. Somados no mesmo
         elemento, um sobrescreveria o outro. */
      const espX = gsap.quickTo(".cp-espiral-mov", "x", { duration: 1.1, ease: "power3.out" });
      const espY = gsap.quickTo(".cp-espiral-mov", "y", { duration: 1.3, ease: "power3.out" });

      const mover = (e: PointerEvent) => {
        const r = raiz.current!.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        /* 34px com fatores distintos lê mais profundo do que 130px com
           tudo voando: paralaxe convence por diferença entre planos, não
           por distância percorrida. */
        camadas.forEach((c) => {
          c.x(-dx * 34 * c.mov);
          c.y(-dy * 18 * c.mov);
        });
        colX(-dx * 12);
        colY(-dy * 7);
        espX(-dx * 52);
        espY(-dy * 30);
      };

      const sair = () => {
        camadas.forEach((c) => {
          c.x(0);
          c.y(0);
        });
        colX(0);
        colY(0);
        espX(0);
        espY(0);
      };

      const alvo = raiz.current!;
      alvo.addEventListener("pointermove", mover);
      alvo.addEventListener("pointerleave", sair);

      /* A espiral fica para trás da página, como as colunas da galeria do
         DAPS: desce meia altura de janela enquanto a capa sobe, então ela
         parece estar num plano mais fundo que o resto do site. O CSS
         posiciona com `translate` e o GSAP escreve `transform` — cada um
         no seu atributo, sem disputa. */
      const noCelular = window.matchMedia("(max-width: 899px)").matches;

      /* No celular a espiral não flutua na cena: ela é um bloco na fila,
         logo abaixo dos botões. Empurrar esse bloco meia tela para baixo
         abriria um buraco no meio da página. */
      if (!noCelular)
        gsap.to(".cp-espiral", {
          y: () => window.innerHeight * 0.42,
          ease: "none",
          scrollTrigger: {
            trigger: raiz.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

      /* a mesma profundidade, agora no eixo vertical, durante a rolagem */
      camadas.forEach((c) => {
        gsap.fromTo(
          c.el,
          { yPercent: 0 },
          {
            yPercent: -8 * c.mov,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: raiz.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5 + c.mov * 0.6,
            },
          },
        );
      });

      return () => {
        alvo.removeEventListener("pointermove", mover);
        alvo.removeEventListener("pointerleave", sair);
      };
    },
    { scope: raiz },
  );

  return (
    <section className="cp" id="capa" ref={raiz}>
      {/* ---- metade chapada ---- */}
      <div className="cp-texto">
        <p className="cp-rot mono">
          <i aria-hidden="true" />
          {MARCA.pessoa} · vídeo, marca e social
        </p>

        <h1 className="cp-h1">
          <span className="cp-linha">
            <span>Design não é só</span>
          </span>
          <span className="cp-linha">
            <span>sobre ser bonito.</span>
          </span>
          <span className="cp-linha">
            <span>
              É sobre ser <em className="serifa laranja">impossível</em>
            </span>
          </span>
          <span className="cp-linha">
            <span>de ignorar</span>
          </span>
        </h1>

        <p className="cp-sub">
          Edição e captação, identidade visual e o que vai no feed toda semana.
          Uma cabeça só cuidando de tudo, então nada sai com cara de peça avulsa.
        </p>

        <div className="cp-acoes">
          <a
            className="botao"
            href={MARCA.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Chamar no WhatsApp
          </a>
          <a className="botao botao-vazado" href="#trabalho">
            Ver o trabalho
          </a>
        </div>

      </div>

      {/* ---- metade da cena ---- */}
      <div className="cp-cena" aria-hidden="true">
        {/* O fundo é um shader: dobras de tecido em movimento lento na
            cor da marca. Entrou no lugar de uma fotografia de sete
            megabytes, nunca se repete e a cor sai do tema. */}
        {/* O crachá pendurado, com física de verdade: a pessoa pode
            pegar e balançar. É o objeto da cena, no lugar onde antes
            estava o símbolo chapado. */}
        <span className="cn-pos cn-fundo">
          <Silk speed={4.9} scale={1.1} color="#5e2b05" noiseIntensity={0.7} rotation={0} />
        </span>

        <span className="cn-veu" />
      </div>

      {/* ---- a espiral de trabalho, no lado da cena ----
          Saiu de dentro de .cp-cena porque aquele bloco é aria-hidden e
          estes cartões são links de verdade para os projetos. */}
      <div className="cp-espiral">
        <div className="cp-espiral-mov">
          <InfiniteSpiral
          items={ESPIRAL_CAPA}
          animationMode="auto"
          speed={0.18}
          radius={240}
          cardWidth={150}
          cardHeight={150}
          verticalSpacing={78}
          perspective={1000}
          cardRadius={14}
          centerScale={1.2}
          edgeBlur={6}
          cardsPerTurn={7}
          pauseOnHover
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.3}
          imageFit="cover"
            grayscale={1}
          />
        </div>
      </div>
      {/* ---- a chamada de rolagem, no centro do rodapé da capa ----
          É link e não enfeite: clicar leva para o trabalho, que é o que
          a pessoa está procurando quando olha para baixo. */}
      <a className="cp-role mono" href="#trabalho">
        role para baixo
        <i aria-hidden="true" />
      </a>

    </section>
  );
}
