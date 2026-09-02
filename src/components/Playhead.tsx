"use client";

/* ============================================================
   O PLAYHEAD

   A barra de progresso da página, dita no vocabulário de quem monta
   vídeo: fita preenchida, cabeça que anda, timecode em 24 quadros por
   segundo e o nome do clipe atual.

   A conta é feita com `requestAnimationFrame` e não a cada evento de
   rolagem: a rolagem dispara muito mais vezes do que a tela redesenha,
   e escrever no DOM em toda uma delas trava o scrub.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { CLIPES } from "../dados";

/* duração fictícia da "sequência": a página inteira equivale a 2m10s.
   Só serve para o timecode andar num ritmo que parece de vídeo. */
const DURACAO = 130;
const FPS = 24;

function paraTimecode(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  const f = Math.floor((segundos % 1) * FPS);
  const dd = (n: number) => String(n).padStart(2, "0");
  return `${dd(h)}:${dd(m)}:${dd(s)}:${dd(f)}`;
}

export default function Playhead() {
  const fita = useRef<HTMLDivElement>(null);
  const cabeca = useRef<HTMLDivElement>(null);
  const [tc, setTc] = useState("00:00:00:00");
  const [clipe, setClipe] = useState(CLIPES[0].nome);

  useEffect(() => {
    let id = 0;
    let ultimo = -1;

    const passo = () => {
      const alcance =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = alcance > 0 ? Math.min(window.scrollY / alcance, 1) : 0;

      if (Math.abs(p - ultimo) > 0.0005) {
        ultimo = p;
        if (fita.current) fita.current.style.width = `${p * 100}%`;
        if (cabeca.current) cabeca.current.style.left = `${p * 100}%`;
        setTc(paraTimecode(p * DURACAO));
      }

      id = requestAnimationFrame(passo);
    };

    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, []);

  /* O nome do clipe vem de quem está ocupando o meio da tela, e não da
     porcentagem rolada: seções têm alturas diferentes, e o meio da tela
     é o que a pessoa está de fato lendo. */
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const achado = CLIPES.find((c) => c.id === e.target.id);
          if (achado) setClipe(achado.nome);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    for (const c of CLIPES) {
      const el = document.getElementById(c.id);
      if (el) observador.observe(el);
    }

    return () => observador.disconnect();
  }, []);

  return (
    <>
      <div className="playhead" aria-hidden="true">
        <div className="playhead-fita" ref={fita} />
        <div className="playhead-cabeca" ref={cabeca} />
      </div>
      <div className="playhead-tc mono" aria-hidden="true">
        <b />
        <span>{tc}</span>
        <span style={{ opacity: 0.5 }}>/</span>
        {clipe}
      </div>
    </>
  );
}
