"use client";

/* ============================================================
   A PÁGINA DE UM PROJETO

   A página inteira VESTE o projeto: fundo, acento e fonte de manchete
   vêm de src/temas.ts e são escritos como variáveis no container. Menu,
   botões, faixas e rodapé leem essas mesmas variáveis, então tudo muda
   junto sem uma linha de estilo duplicada.

   A leitura tem QUATRO tempos, e cada um responde uma pergunta:

   1. CAPA cheia — a primeira peça ao fundo, escurecida e em paralaxe,
      com o nome por cima. Diz o que é isso antes de qualquer rolagem.
   2. FICHA — o resumo grande de um lado; números e nota de direção
      grudados do outro. Diz o que foi entregue e por quê.
   3. PEÇAS — grade de doze colunas: peça deitada ocupa a linha inteira,
      peça em pé ocupa um terço, o resto fica em meia largura. Empilhar
      tudo numa coluna só era o que fazia a página parecer uma pasta de
      arquivos aberta.
   4. PORTA — o próximo projeto, já pintado com a cor DELE.

   O contador fixo no canto marca a peça que está na tela: a página é
   uma sequência, e dizer em que quadro se está é o mesmo argumento da
   ilha de edição da home.
   ============================================================ */

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP, revelar, gsap, semMovimento, EASE } from "../lib/anim";
import type { Peca, Projeto } from "../dados";
import { MARCA } from "../dados";
import { TEMAS, TEMA_CASA, varsDoTema } from "../temas";
import Suave from "./Suave";
import Nav from "./Nav";
import Rodape from "./Rodape";
import AberturaProjeto from "./AberturaProjeto";
import PecaVideo from "./PecaVideo";
import { useCortina } from "../lib/cortina";

/* o laranja da casa: a home nunca é aberta na cor de um projeto */
const LARANJA_CASA = "#f57c1f";

function ehVideo(p: { tipo: string }) {
  return p.tipo === "video";
}

/* Que fatia da grade cada peça ocupa. A proporção decide sozinha: peça
   deitada precisa de largura para ser lida, peça em pé precisa de
   altura — e três em pé lado a lado ocupam o espaço de uma deitada. */
function faixa(p: Peca) {
  const razao = p.largura / Math.max(p.altura, 1);
  if (razao >= 1.7) return "pj-larga";
  if (razao <= 0.85) return "pj-alta";
  return "pj-media";
}

function miniatura(p: Peca) {
  return p.tipo === "video" ? p.capa : p.src;
}

export default function ProjetoPagina({
  projeto,
  proximo,
}: {
  projeto: Projeto;
  proximo: Projeto;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const tema = TEMAS[projeto.slug] ?? TEMA_CASA;
  const temaProximo = TEMAS[proximo.slug] ?? TEMA_CASA;
  /* sair daqui tem a mesma virada de cor de entrar */
  const irCom = useCortina();

  /* qual peça está na tela, para o contador do canto */
  const [naTela, setNaTela] = useState(1);

  const videos = projeto.pecas.filter(ehVideo).length;
  const imagens = projeto.pecas.length - videos;
  const capa = miniatura(projeto.pecas[0]);
  const capaProximo = miniatura(proximo.pecas[0]);

  useGSAP(
    () => {
      revelar(raiz.current, ".sobe");
      if (semMovimento()) return;

      /* ---- a capa ---- */
      gsap
        .timeline({ delay: 0.12 })
        .from(".pj-capa .mascara > span", {
          yPercent: 112,
          duration: 1,
          ease: EASE,
          stagger: 0.08,
        })
        .from(
          ".pj-ap",
          { autoAlpha: 0, y: 16, duration: 0.6, ease: EASE, stagger: 0.07 },
          "-=0.55",
        );

      /* A imagem da capa afunda enquanto o texto sobe: é a diferença de
         planos da capa da home, e é ela que impede a primeira tela de
         parecer um banner parado. */
      gsap.to(".pj-fundo", {
        yPercent: 12,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: ".pj-capa",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* ---- o resumo acende palavra por palavra ---- */
      gsap.fromTo(
        ".pj-palavra",
        { opacity: 0.2 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.03,
          scrollTrigger: {
            trigger: ".pj-ficha",
            start: "top bottom-=12%",
            end: "center center",
            scrub: 0.4,
          },
        },
      );

      /* ---- cada peça entra pelo próprio recorte ----
         `clip-path` no lugar de opacidade: a peça aparece como quem puxa
         um cartaz para fora do envelope, e o corte deixa claro que a
         imagem tem borda — coisa que um fade não diz. */
      gsap.utils.toArray<HTMLElement>(".pj-peca", raiz.current).forEach((peca, i) => {
        gsap.fromTo(
          peca,
          { clipPath: "inset(14% 0% 14% 0%)", y: 34, autoAlpha: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: EASE,
            scrollTrigger: { trigger: peca, start: "top 86%", once: true },
          },
        );

        /* o contador do canto: sem animação, só avisa quem entrou — e
           sem `once`, porque ele precisa contar na volta também */
        gsap.timeline({
          scrollTrigger: {
            trigger: peca,
            start: "top 60%",
            end: "bottom 60%",
            onEnter: () => setNaTela(i + 1),
            onEnterBack: () => setNaTela(i + 1),
          },
        });
      });

      /* ---- a porta do próximo projeto ---- */
      gsap.to(".pj-proximo-fundo", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".pj-proximo",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: raiz },
  );

  return (
    <div className="tema" style={varsDoTema(tema)} ref={raiz}>
      {/* a virada de cor ao abrir o projeto, na cor da marca dele */}
      <AberturaProjeto cor={tema.acento} />
      <Suave />
      <Nav />

      <main>
        {/* ---------- 1. capa ---------- */}
        <header className="pj-capa">
          <div className="pj-fundo" aria-hidden="true">
            {capa && (
              <Image
                src={capa}
                alt=""
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <span className="pj-veu" aria-hidden="true" />

          <div className="pj-capa-texto">
            <p className="pj-volta mono pj-ap">
              <Link href="/#trabalho" onClick={(e) => irCom(e, "/#trabalho", LARANJA_CASA)}>
                ← Voltar para o trabalho
              </Link>
            </p>

            <h1 className="pj-titulo display">
              <span className="mascara">
                <span>{projeto.titulo}</span>
              </span>
            </h1>

            <div className="pj-linha pj-ap">
              <span className="pj-tipo mono">{projeto.tipo}</span>
              <span className="pj-conta mono">
                {String(projeto.pecas.length).padStart(2, "0")} peças
              </span>
            </div>
          </div>

          <p className="pj-role mono pj-ap" aria-hidden="true">
            rolar
          </p>
        </header>

        {/* ---------- 2. ficha ---------- */}
        <section className="pj-ficha">
          <div className="pj-ficha-texto">
            <p className="clipe mono sobe">Sobre o projeto</p>
            <p className="pj-resumo">
              {projeto.resumo.split(/(\s+)/).map((pedaco, i) =>
                /^\s+$/.test(pedaco) ? (
                  pedaco
                ) : (
                  <span className="pj-palavra" key={i}>
                    {pedaco}
                  </span>
                ),
              )}
            </p>
          </div>

          <aside className="pj-ficha-lado">
            <dl className="pj-numeros sobe">
              <div>
                <dt className="mono">Peças</dt>
                <dd className="display">{String(projeto.pecas.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt className="mono">Vídeo</dt>
                <dd className="display">{String(videos).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt className="mono">Imagem</dt>
                <dd className="display">{String(imagens).padStart(2, "0")}</dd>
              </div>
            </dl>

            {/* a nota da direção fica visível: é o que separa portfólio
                de galeria de arquivos */}
            <p className="pj-nota sobe">{tema.nota}</p>
          </aside>
        </section>

        {/* ---------- 3. peças ---------- */}
        <div className="pj-pecas">
          {projeto.pecas.map((p, n) => (
            <figure className={`pj-peca ${faixa(p)}`} key={p.src}>
              {/* O quadro nunca passa da largura NATIVA do arquivo:
                  esticar um reel de 360px para meia tela era o que
                  deixava as peças borradas. */}
              <div className="pj-quadro" style={{ maxWidth: p.largura }}>
                {ehVideo(p) ? (
                  <PecaVideo
                    src={p.src}
                    poster={p.capa}
                    rotulo={`${projeto.titulo}, peça ${n + 1}`}
                  />
                ) : (
                  /* O otimizador entrega AVIF/WebP no tamanho da coluna.
                     Servir os originais era o que fazia a página baixar
                     dezenas de megabytes e engasgar na rolagem. */
                  <Image
                    src={p.src}
                    alt={`${projeto.titulo}, peça ${n + 1}`}
                    width={p.largura}
                    height={p.altura}
                    priority={n < 2}
                    loading={n < 2 ? "eager" : "lazy"}
                    sizes={
                      faixa(p) === "pj-larga"
                        ? "(max-width: 700px) 100vw, 90vw"
                        : faixa(p) === "pj-alta"
                          ? "(max-width: 700px) 100vw, 33vw"
                          : "(max-width: 700px) 100vw, 50vw"
                    }
                    style={{ width: "100%", height: "auto" }}
                  />
                )}
              </div>
              <figcaption className="mono">
                <span>{String(n + 1).padStart(2, "0")}</span>
                <span>{ehVideo(p) ? "Vídeo" : "Imagem"}</span>
                <span>
                  {p.largura}×{p.altura}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* o contador da sequência, fixo no canto */}
        <p className="pj-contador mono" aria-hidden="true">
          {String(naTela).padStart(2, "0")}
          <i>/</i>
          {String(projeto.pecas.length).padStart(2, "0")}
        </p>

        {/* ---------- 4. porta para o próximo ----------
            Já está pintada com o tema DELE: a troca de identidade começa
            antes do clique. */}
        <Link
          className="pj-proximo"
          href={`/trabalho/${proximo.slug}`}
          onClick={(e) => irCom(e, `/trabalho/${proximo.slug}`, temaProximo.acento)}
          style={varsDoTema(temaProximo)}
        >
          <span className="pj-proximo-fundo" aria-hidden="true">
            {capaProximo && (
              <Image
                src={capaProximo}
                alt=""
                fill
                loading="lazy"
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            )}
          </span>

          <span className="pj-proximo-texto">
            <span className="pj-proximo-tarja mono">Próximo projeto</span>
            <span className="pj-proximo-nome display">{proximo.titulo}</span>
            <span className="pj-proximo-tipo mono">{proximo.tipo}</span>
          </span>

          {/* o alvo redondo à direita: sem ele o bloco lia como banner, e
              não como a porta que é */}
          <span className="pj-proximo-seta" aria-hidden="true">
            →
          </span>
        </Link>

        <section className="pj-fim">
          <h2 className="pj-fim-titulo display">Quer a sua marca com essa cara?</h2>
          <div className="capa-acoes">
            <a className="botao" href={MARCA.whatsapp} target="_blank" rel="noreferrer">
              Chamar no WhatsApp
            </a>
            <Link
              className="botao botao-vazado"
              href="/#trabalho"
              onClick={(e) => irCom(e, "/#trabalho", LARANJA_CASA)}
            >
              Ver os outros projetos
            </Link>
          </div>
        </section>
      </main>

      <Rodape />
      <div className="grao" aria-hidden="true" />
    </div>
  );
}
