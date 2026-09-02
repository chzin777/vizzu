"use client";

/* ============================================================
   MAGIC BENTO — a vitrine

   O componente original do React Bits, com três mudanças que ele
   precisava para virar portfólio em vez de demonstração:

   · os cartões vêm dos projetos e são LINKS para a página de cada um,
     não divs decorativas. O efeito é enfeite; a navegação é o conteúdo.

   · o brilho usa o acento do tema (a variável `--laranja`), então nas
     páginas de projeto ele muda junto com a marca, em vez do roxo fixo.

   · cada cartão carrega a capa do projeto. Cartão de portfólio sem a
     peça dentro é caixa vazia com título.

   O resto — partículas no hover, holofote que segue o ponteiro pela
   seção, borda que acende por proximidade e a onda no clique — é o
   comportamento original, preservado.
   ============================================================ */

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cortinar } from "../lib/cortina";
import { gsap } from "gsap";
import { PROJETOS } from "../dados";
import { TEMAS } from "../temas";

const PARTICULAS = 12;
const RAIO_HOLOFOTE = 400;
const CELULAR = 768;

type Props = {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
};

const criarParticula = (x: number, y: number, cor: string) => {
  const el = document.createElement("div");
  el.className = "bento-particula";
  el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${cor},1);box-shadow:0 0 6px rgba(${cor},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
  return el;
};

const valoresHolofote = (raio: number) => ({
  proximidade: raio * 0.5,
  distanciaFade: raio * 0.75,
});

const escreverBrilho = (
  card: HTMLElement,
  mx: number,
  my: number,
  brilho: number,
  raio: number,
) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--glow-x", `${((mx - r.left) / r.width) * 100}%`);
  card.style.setProperty("--glow-y", `${((my - r.top) / r.height) * 100}%`);
  card.style.setProperty("--glow-intensity", String(brilho));
  card.style.setProperty("--glow-radius", `${raio}px`);
};

/* ---------- o cartão com partículas ---------- */

function CartaoParticulas({
  children,
  className = "",
  href,
  onClick,
  onPointerEnter,
  onPointerLeave,
  style,
  disableAnimations = false,
  particleCount = PARTICULAS,
  glowColor,
  enableTilt = false,
  clickEffect = true,
  enableMagnetism = false,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  style?: React.CSSProperties;
  disableAnimations?: boolean;
  particleCount?: number;
  glowColor: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}) {
  const card = useRef<HTMLAnchorElement>(null);
  const vivas = useRef<HTMLDivElement[]>([]);
  const relogios = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dentro = useRef(false);
  const molde = useRef<HTMLDivElement[]>([]);
  const prontas = useRef(false);
  const magnetismo = useRef<gsap.core.Tween | null>(null);

  const preparar = useCallback(() => {
    if (prontas.current || !card.current) return;
    const { width, height } = card.current.getBoundingClientRect();
    molde.current = Array.from({ length: particleCount }, () =>
      criarParticula(Math.random() * width, Math.random() * height, glowColor),
    );
    prontas.current = true;
  }, [particleCount, glowColor]);

  const limpar = useCallback(() => {
    relogios.current.forEach(clearTimeout);
    relogios.current = [];
    magnetismo.current?.kill();

    vivas.current.forEach((p) => {
      gsap.to(p, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => p.parentNode?.removeChild(p),
      });
    });
    vivas.current = [];
  }, []);

  const soltar = useCallback(() => {
    if (!card.current || !dentro.current) return;
    if (!prontas.current) preparar();

    molde.current.forEach((p, i) => {
      const t = setTimeout(() => {
        if (!dentro.current || !card.current) return;

        const copia = p.cloneNode(true) as HTMLDivElement;
        card.current.appendChild(copia);
        vivas.current.push(copia);

        gsap.fromTo(
          copia,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        );
        gsap.to(copia, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(copia, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, i * 100);

      relogios.current.push(t);
    });
  }, [preparar]);

  useEffect(() => {
    if (disableAnimations || !card.current) return;
    const el = card.current;

    const entrou = () => {
      dentro.current = true;
      soltar();
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const saiu = () => {
      dentro.current = false;
      limpar();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };

    const moveu = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;

      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -10,
          rotateY: ((x - cx) / cx) * 10,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        magnetismo.current = gsap.to(el, {
          x: (x - cx) * 0.05,
          y: (y - cy) * 0.05,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const clicou = (e: MouseEvent) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const raio = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height),
      );

      const onda = document.createElement("div");
      onda.style.cssText = `position:absolute;width:${raio * 2}px;height:${raio * 2}px;border-radius:50%;background:radial-gradient(circle, rgba(${glowColor},0.4) 0%, rgba(${glowColor},0.2) 30%, transparent 70%);left:${x - raio}px;top:${y - raio}px;pointer-events:none;z-index:1000;`;
      el.appendChild(onda);

      gsap.fromTo(
        onda,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => onda.remove(),
        },
      );
    };

    el.addEventListener("mouseenter", entrou);
    el.addEventListener("mouseleave", saiu);
    el.addEventListener("mousemove", moveu);
    el.addEventListener("click", clicou);

    return () => {
      dentro.current = false;
      el.removeEventListener("mouseenter", entrou);
      el.removeEventListener("mouseleave", saiu);
      el.removeEventListener("mousemove", moveu);
      el.removeEventListener("click", clicou);
      limpar();
    };
  }, [soltar, limpar, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <Link
      className={className}
      href={href}
      style={style}
      ref={card}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </Link>
  );
}

/* ---------- o holofote que segue o ponteiro ---------- */

function Holofote({
  grade,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = RAIO_HOLOFOTE,
  glowColor,
}: {
  grade: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor: string;
}) {
  useEffect(() => {
    if (disableAnimations || !grade?.current || !enabled) return;

    const luz = document.createElement("div");
    luz.className = "bento-holofote";
    luz.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, rgba(${glowColor},0.15) 0%, rgba(${glowColor},0.08) 15%, rgba(${glowColor},0.04) 25%, rgba(${glowColor},0.02) 40%, rgba(${glowColor},0.01) 65%, transparent 70%);z-index:5;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(luz);

    const moveu = (e: MouseEvent) => {
      if (!grade.current) return;
      const secao = grade.current.closest(".bento");
      const r = secao?.getBoundingClientRect();
      const dentro =
        r &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;

      const cards = grade.current.querySelectorAll<HTMLElement>(".bento-card");

      if (!dentro) {
        gsap.to(luz, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((c) => c.style.setProperty("--glow-intensity", "0"));
        return;
      }

      const { proximidade, distanciaFade } = valoresHolofote(spotlightRadius);
      let menor = Infinity;

      cards.forEach((c) => {
        const cr = c.getBoundingClientRect();
        const d =
          Math.hypot(e.clientX - (cr.left + cr.width / 2), e.clientY - (cr.top + cr.height / 2)) -
          Math.max(cr.width, cr.height) / 2;
        const dist = Math.max(0, d);
        menor = Math.min(menor, dist);

        let brilho = 0;
        if (dist <= proximidade) brilho = 1;
        else if (dist <= distanciaFade)
          brilho = (distanciaFade - dist) / (distanciaFade - proximidade);

        escreverBrilho(c, e.clientX, e.clientY, brilho, spotlightRadius);
      });

      gsap.to(luz, { left: e.clientX, top: e.clientY, duration: 0.1, ease: "power2.out" });

      const alvo =
        menor <= proximidade
          ? 0.8
          : menor <= distanciaFade
            ? ((distanciaFade - menor) / (distanciaFade - proximidade)) * 0.8
            : 0;

      gsap.to(luz, {
        opacity: alvo,
        duration: alvo > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const saiu = () => {
      grade.current
        ?.querySelectorAll<HTMLElement>(".bento-card")
        .forEach((c) => c.style.setProperty("--glow-intensity", "0"));
      gsap.to(luz, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", moveu);
    document.addEventListener("mouseleave", saiu);

    return () => {
      document.removeEventListener("mousemove", moveu);
      document.removeEventListener("mouseleave", saiu);
      luz.parentNode?.removeChild(luz);
    };
  }, [grade, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
}

function usarCelular() {
  const [celular, setCelular] = useState(false);
  useEffect(() => {
    const ver = () => setCelular(window.innerWidth <= CELULAR);
    ver();
    window.addEventListener("resize", ver);
    return () => window.removeEventListener("resize", ver);
  }, []);
  return celular;
}

export default function MagicBento({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = RAIO_HOLOFOTE,
  particleCount = PARTICULAS,
  enableTilt = false,
  glowColor = "245, 124, 31",
  clickEffect = true,
  enableMagnetism = false,
}: Props) {
  const grade = useRef<HTMLDivElement>(null);
  const celular = usarCelular();
  /* No celular tudo isso é peso sem retorno: não há ponteiro para o
     holofote seguir, e as partículas só gastam bateria. */
  const semEfeitos = disableAnimations || celular;

  const router = useRouter();

  return (
    <>
      {enableSpotlight && (
        <Holofote
          grade={grade}
          disableAnimations={semEfeitos}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="bento" ref={grade}>
        <div className="bento-grade">
          {PROJETOS.map((p, i) => {
            const capa = p.pecas[0];
            const fonte = capa.tipo === "video" ? capa.capa : capa.src;
            const videos = p.pecas.filter((x) => x.tipo === "video").length;
            const tema = TEMAS[p.slug];
            /* o brilho de cada cartão é a cor DAQUELE projeto */
            const cor = tema
              ? `${parseInt(tema.acento.slice(1, 3), 16)}, ${parseInt(tema.acento.slice(3, 5), 16)}, ${parseInt(tema.acento.slice(5, 7), 16)}`
              : glowColor;

            const classe = `bento-card sobe${enableBorderGlow ? " bento-borda" : ""}${
              i === 0 ? " bento-card-largo" : ""
            }`;

            const estilo = {
              "--glow-color": cor,
              "--glow-x": "50%",
              "--glow-y": "50%",
              "--glow-intensity": "0",
              "--glow-radius": `${spotlightRadius}px`,
            } as React.CSSProperties;

            /* o clique não navega na hora: primeiro a cor do projeto
               toma a tela a partir do ponto clicado, e só então a rota
               troca. Cliques de meio, com Ctrl/Cmd ou em nova aba não
               entram aqui — abrir noutra aba não tem transição. */
            const abrir = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              const destino = `/trabalho/${p.slug}`;
              router.prefetch(destino);
              cortinar(tema?.acento ?? "#f57c1f", e.clientX, e.clientY).then(() =>
                router.push(destino),
              );
            };

            const conteudo = (
              <>
                <span className="bento-capa">
                  {fonte && (
                    <Image
                      src={fonte}
                      alt=""
                      fill
                      sizes={
                        i === 0
                          ? "(max-width: 700px) 100vw, 66vw"
                          : "(max-width: 700px) 100vw, 33vw"
                      }
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </span>

                <span className="bento-topo mono">{p.tipo}</span>

                <span className="bento-pe">
                  {/* Sem o resumo: ele já está na página do projeto, e no
                      cartão só empurrava a peça para longe. Aqui bastam a
                      marca, o tipo e o tamanho do trabalho. */}
                  <span className={`bento-nome display${textAutoHide ? " bento-corta" : ""}`}>
                    {p.titulo}
                  </span>
                  <span className="bento-conta mono">
                    {p.pecas.length} peças
                    {videos > 0 ? ` · ${videos} em vídeo` : ""} · abrir ↗
                  </span>
                </span>
              </>
            );

            if (enableStars) {
              return (
                <CartaoParticulas
                  key={p.slug}
                  className={classe}
                  href={`/trabalho/${p.slug}`}
                  onClick={abrir}
                  style={estilo}
                  disableAnimations={semEfeitos}
                  particleCount={particleCount}
                  glowColor={cor}
                  enableTilt={enableTilt}
                  clickEffect={clickEffect}
                  enableMagnetism={enableMagnetism}
                >
                  {conteudo}
                </CartaoParticulas>
              );
            }

            return (
              <Link
                className={classe}
                key={p.slug}
                href={`/trabalho/${p.slug}`}
                onClick={abrir}
                style={estilo}
              >
                {conteudo}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
