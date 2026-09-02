"use client";

/* ============================================================
   MANIFESTO — a virada para o branco

   Primeira inversão da página. O bloco existe para responder a única
   pergunta que quem contrata faz antes de olhar preço: por que essa
   pessoa e não a agência da esquina.

   Antes era três parágrafos e nada mais, e lia como página de "sobre
   nós" de site de contabilidade. Agora a seção tem a CARA da pessoa e
   três mecanismos, todos emprestados do DAPS:

   · o retrato inclina com o ponteiro e sai do cinza quando o mouse
     chega — é o objeto da seção, e objeto que não reage parece adesivo;
   · o texto acende PALAVRA POR PALAVRA conforme a rolagem, do jeito do
     ScrollReveal: quem passa rápido vê o bloco acender, quem lê devagar
     lê no ritmo em que acende;
   · a faixa de palavras corre por baixo e MUDA DE VELOCIDADE com a
     rolagem, que é a ScrollVelocity do mesmo projeto.

   Os números da ficha saem dos dados do portfólio, não de um chute:
   mexer no portfolio.json muda a contagem sozinho.
   ============================================================ */

import { useMemo, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, revelar, semMovimento } from "../lib/anim";
import { MARCA, PROJETOS } from "../dados";

/* as palavras da faixa; repetidas em duas cópias para o laço fechar */
const FAIXA = [
  "edição",
  "identidade visual",
  "captação",
  "direção de arte",
  "social",
  "cor",
  "tipografia",
  "movimento",
];

const PARAGRAFOS = [
  `Sou ${MARCA.pessoa}. Trabalho com vídeo e identidade visual, e as duas coisas juntas de propósito: quem edita entende ritmo, e quem desenha marca entende o que sobra quando o vídeo acaba.`,
  "A maior parte do que eu recebo já foi feito por alguém. O problema quase nunca é qualidade de arquivo. É que a peça não decide o que quer dizer. Some no feed porque não briga por atenção, e não porque está feia.",
  "Então eu começo pela decisão, não pelo Photoshop. Primeiro o que a peça precisa provar; depois a cor, o corte e a fonte que provam aquilo. É por isso que o resultado costuma ser mais simples do que o cliente esperava, e mais difícil de esquecer.",
];

/* uma palavra por span: é o que permite acender em cascata */
function Palavras({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\s+)/).map((pedaco, i) =>
        /^\s+$/.test(pedaco) ? (
          pedaco
        ) : (
          <span className="mf-palavra" key={i}>
            {pedaco}
          </span>
        ),
      )}
    </>
  );
}

export default function Manifesto() {
  const raiz = useRef<HTMLElement>(null);

  const fatos = useMemo(() => {
    const pecas = PROJETOS.reduce((n, p) => n + p.pecas.length, 0);
    const videos = PROJETOS.reduce(
      (n, p) => n + p.pecas.filter((x) => x.tipo === "video").length,
      0,
    );
    return [
      { n: PROJETOS.length, rot: "Projetos" },
      { n: pecas, rot: "Peças entregues" },
      { n: videos, rot: "Vídeos montados" },
    ];
  }, []);

  useGSAP(
    () => {
      revelar(raiz.current);
      if (semMovimento()) return;

      /* ---- o texto acende palavra por palavra, preso à rolagem ----
         Sem `scrub` isso viraria um stagger de meio segundo que ninguém
         vê. Preso à rolagem, a leitura e a animação andam no mesmo
         relógio: a pessoa lê no ritmo em que a linha aparece. */
      gsap.utils.toArray<HTMLElement>(".mf-bloco", raiz.current).forEach((bloco) => {
        gsap.fromTo(
          bloco.querySelectorAll(".mf-palavra"),
          { opacity: 0.22, filter: "blur(3px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            stagger: 0.02,
            scrollTrigger: {
              trigger: bloco,
              /* O bloco termina de acender quando o TOPO dele chega ao
                 meio da tela. Com o fim em "bottom center" o parágrafo
                 só ficava cheio quando já estava saindo — a leitura
                 acontece antes disso. */
              start: "top bottom-=12%",
              end: "top center",
              scrub: 0.4,
            },
          },
        );
      });

      /* ---- o retrato inclina com o ponteiro ----
         A moldura recebe a inclinação e a foto anda um pouco por dentro:
         a diferença entre os dois planos é o que dá volume. Uma
         inclinação só, na moldura inteira, lê como cartão girando. */
      const moldura = raiz.current!.querySelector<HTMLElement>(".mf-moldura");
      const foto = raiz.current!.querySelector<HTMLElement>(".mf-foto");
      if (moldura && foto) {
        const rx = gsap.quickTo(moldura, "rotationX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(moldura, "rotationY", { duration: 0.8, ease: "power3.out" });
        const fx = gsap.quickTo(foto, "x", { duration: 1, ease: "power3.out" });
        const fy = gsap.quickTo(foto, "y", { duration: 1.1, ease: "power3.out" });

        const mover = (e: PointerEvent) => {
          const r = moldura.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          rx(-dy * 12);
          ry(dx * 14);
          fx(dx * 22);
          fy(dy * 16);
        };
        const sair = () => {
          rx(0);
          ry(0);
          fx(0);
          fy(0);
        };
        moldura.addEventListener("pointermove", mover);
        moldura.addEventListener("pointerleave", sair);

        /* a foto sobe mais devagar que a coluna de texto: o mesmo
           paralaxe de rolagem que a capa usa, em dose menor */
        gsap.to(foto, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: ".mf-retrato",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        /* ---- a faixa de palavras muda de velocidade com a rolagem ----
           Ela anda sozinha o tempo todo; a rolagem só empurra. Faixa que
           só se mexe quando se rola morre quando a página para. */
        const trilhos = gsap.utils.toArray<HTMLElement>(".mf-trilho", raiz.current);
        /* O `delta` do ticker vem em MILISSEGUNDOS. Tratado como segundo,
           a faixa andava umas sessenta vezes mais rápido do que devia —
           era esse o borrão. Aqui a velocidade é em % por segundo. */
        const VELOCIDADE = 0.7;
        /* A faixa tem quatro cópias da lista, então UMA cópia é 25% da
           largura: é nesse valor que o laço fecha sem salto. */
        const VOLTA = 25;
        let deslocamento = 0;
        let empurrao = 0;
        /* a faixa só anda quando a seção está na tela: correr escondida
           é repintura por nada */
        let visivel = true;
        const olho = new IntersectionObserver(
          ([e]) => {
            visivel = e.isIntersecting;
          },
          { rootMargin: "120px" },
        );
        if (raiz.current) olho.observe(raiz.current);

        const passo = (_t: number, delta: number) => {
          if (!visivel) return;
          empurrao *= 0.94;
          deslocamento = (deslocamento + (VELOCIDADE + empurrao) * (delta / 1000)) % VOLTA;
          trilhos.forEach((t, i) => {
            gsap.set(t, { xPercent: i % 2 === 0 ? -deslocamento : deslocamento - VOLTA });
          });
        };
        gsap.ticker.add(passo);

        let ultimo = window.scrollY;
        const naRolagem = () => {
          const agora = window.scrollY;
          /* a rolagem só EMPURRA; o valor é limitado para um giro rápido
             de roda não jogar a faixa para fora da tela */
          empurrao = Math.min(Math.abs(agora - ultimo) * 0.22, 9);
          ultimo = agora;
        };
        window.addEventListener("scroll", naRolagem, { passive: true });

        /* ---- os números contam ao entrar ---- */
        gsap.utils.toArray<HTMLElement>(".mf-numero").forEach((el) => {
          const alvo = Number(el.dataset.n);
          gsap.to(
            { v: 0 },
            {
              v: alvo,
              duration: 1.1,
              ease: "power2.out",
              onUpdate() {
                const v = (this.targets()[0] as { v: number }).v;
                el.textContent = String(Math.round(v)).padStart(2, "0");
              },
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });

        return () => {
          moldura.removeEventListener("pointermove", mover);
          moldura.removeEventListener("pointerleave", sair);
          gsap.ticker.remove(passo);
          olho.disconnect();
          window.removeEventListener("scroll", naRolagem);
        };
      }
    },
    { scope: raiz },
  );

  return (
    <section className="manifesto claro" id="sobre" ref={raiz}>
      <div className="manifesto-grade">
        <div className="mf-cabeca">
          <p className="clipe mono sobe">00:00:38:16 · Quem é</p>
          <h2 className="manifesto-frase display sobe">
            Marca boa não pede <em>licença</em> para aparecer
          </h2>
        </div>

        <div className="mf-corpo">
          {/* ---- o retrato ---- */}
          <figure className="mf-retrato sobe">
            <div className="mf-moldura">
              <Image
                className="mf-foto"
                src="/marca/noah.png"
                alt={MARCA.pessoa}
                width={492}
                height={686}
                sizes="(max-width: 899px) 90vw, 34vw"
              />
              <span className="mf-brilho" aria-hidden="true" />
            </div>
            <figcaption className="mf-legenda mono">
              {MARCA.pessoa} · {MARCA.arroba}
            </figcaption>
          </figure>

          {/* ---- o texto ---- */}
          <div className="manifesto-texto">
            {PARAGRAFOS.map((p, i) => (
              <p className="mf-bloco" key={i}>
                <Palavras texto={p} />
              </p>
            ))}

            <dl className="mf-fatos">
              {fatos.map((f) => (
                <div key={f.rot}>
                  <dd className="mf-numero display" data-n={f.n}>
                    00
                  </dd>
                  <dt className="mono">{f.rot}</dt>
                </div>
              ))}
            </dl>

            <p className="manifesto-selo mono sobe">
              {MARCA.nome} · estúdio de {MARCA.pessoa.split(" ")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* ---- a faixa de palavras, duas linhas em sentidos opostos ---- */}
      <div className="mf-faixa" aria-hidden="true">
        {[0, 1].map((linha) => (
          <div className="mf-trilho display" key={linha}>
            {[...FAIXA, ...FAIXA, ...FAIXA, ...FAIXA].map((palavra, i) => (
              <span key={`${palavra}-${i}`}>
                {palavra}
                <i>·</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
