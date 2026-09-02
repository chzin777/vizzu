"use client";

/* ============================================================
   Base de animação: GSAP + ScrollTrigger + rolagem suave do Lenis.

   Um arquivo só, importado por todas as seções, para que o plugin seja
   registrado uma vez e o `ticker` do GSAP seja o mesmo relógio da
   rolagem. Sem isso o `scrub` fica granulado no trackpad.
   ============================================================ */

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export const EASE = "power3.out";

/* A instância viva do Lenis, guardada no módulo.

   `overflow: hidden` no documento NÃO segura o Lenis: ele não usa a
   rolagem nativa, aplica a posição por script. Quem abre um modal
   precisa alcançá-lo de fora para parar a página de trás. */
let lenisVivo: Lenis | null = null;

/** Para ou retoma a rolagem suave. Devolve `false` se não há Lenis. */
export function pausarRolagem(pausar: boolean) {
  if (!lenisVivo) return false;
  if (pausar) lenisVivo.stop();
  else lenisVivo.start();
  return true;
}

/** Volta ao topo pelo Lenis; sem ele, pela rolagem nativa. */
export function irParaTopo() {
  if (lenisVivo) lenisVivo.scrollTo(0, { duration: 1 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export const semMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rolagem suave da página inteira, montada uma vez no layout. */
export function useRolagemSuave() {
  useEffect(() => {
    if (semMovimento()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisVivo = lenis;
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    /* Âncoras também rolam suave. Num documento em que tudo desliza, o
       salto seco de um href="#algo" seria o único movimento duro — e é
       justamente o que o menu faz o tempo todo. */
    const clicou = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement | null;
      const a = alvo?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;

      /* Vale para "#trabalho" e também para "/#trabalho": o menu precisa
         funcionar nas páginas de projeto, onde a âncora solta não sairia
         do lugar, e continuar rolando suave quando já estamos na home. */
      const href = a.getAttribute("href");
      if (!href || !href.includes("#")) return;

      const [caminho, hash] = href.split("#");
      if (!hash) return;
      if (caminho && caminho !== "/" && caminho !== location.pathname) return;
      if (caminho === "/" && location.pathname !== "/") return;

      const id = `#${hash}`;
      const destino = document.querySelector(id);
      if (!destino) return;

      e.preventDefault();
      /* a folga tira a barra fixa de cima do título de destino */
      lenis.scrollTo(destino as HTMLElement, { offset: -70, duration: 1.2 });
      history.pushState(null, "", id);
    };

    document.addEventListener("click", clicou);

    return () => {
      document.removeEventListener("click", clicou);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisVivo = null;
    };
  }, []);
}

/**
 * Sobe os elementos marcados com `.sobe` quando entram na tela.
 * `escopo` limita a busca ao componente que chamou.
 */
export function revelar(escopo: Element | null, seletor = ".sobe") {
  if (!escopo) return;
  const alvos = gsap.utils.toArray<HTMLElement>(seletor, escopo);
  if (!alvos.length) return;

  if (semMovimento()) {
    gsap.set(alvos, { opacity: 1, y: 0 });
    return;
  }

  gsap.to(alvos, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: EASE,
    stagger: 0.08,
    scrollTrigger: {
      trigger: escopo,
      start: "top 78%",
    },
  });
}

export { gsap, ScrollTrigger, useGSAP };
