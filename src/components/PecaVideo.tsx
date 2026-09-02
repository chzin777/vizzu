"use client";

/* ============================================================
   VÍDEO COM TIMELINE DA CASA

   O player nativo do navegador é a única peça do site que não é do
   site: barra cinza, ícone de Chrome, cantos do sistema. Num portfólio
   de quem MONTA vídeo, isso é a coisa mais visível da página e não fala
   a língua dela.

   Aqui a barra é a mesma ilha de edição do resto: régua fina, playhead
   no acento do tema, timecode em quadros (24 fps) dos dois lados —
   posição e duração — e o botão de tocar como um alvo grande no centro.

   Nada de biblioteca: é o <video> de sempre, sem `controls`, com a
   nossa camada por cima. Arrastar na régua busca o quadro, e o vídeo só
   carrega o poster até a pessoa pedir para tocar.
   ============================================================ */

import { useEffect, useRef, useState } from "react";

/* o mesmo timecode da home: horas fora, 24 quadros por segundo */
function tc(segundos: number) {
  if (!Number.isFinite(segundos)) return "00:00:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  const q = Math.floor((segundos % 1) * 24);
  return [m, s, q].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function PecaVideo({
  src,
  poster,
  rotulo,
}: {
  src: string;
  poster?: string;
  rotulo: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const regua = useRef<HTMLDivElement>(null);
  const [tocando, setTocando] = useState(false);
  const [posicao, setPosicao] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [mudo, setMudo] = useState(true);
  /* o volume vive aqui e no elemento: o <video> guarda o valor real, o
     estado só desenha a régua */
  const [volume, setVolume] = useState(0.8);
  const regraVol = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const andar = () => setPosicao(el.currentTime);
    const medir = () => setDuracao(el.duration || 0);
    const ligar = () => setTocando(true);
    const parar = () => setTocando(false);

    el.addEventListener("timeupdate", andar);
    el.addEventListener("loadedmetadata", medir);
    el.addEventListener("durationchange", medir);
    el.addEventListener("play", ligar);
    el.addEventListener("pause", parar);
    el.addEventListener("ended", parar);
    return () => {
      el.removeEventListener("timeupdate", andar);
      el.removeEventListener("loadedmetadata", medir);
      el.removeEventListener("durationchange", medir);
      el.removeEventListener("play", ligar);
      el.removeEventListener("pause", parar);
      el.removeEventListener("ended", parar);
    };
  }, []);

  const alternar = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  /* buscar pela régua: o mesmo gesto do clique e do arrasto, porque
     ninguém acerta um quadro num clique só */
  const buscar = (clientX: number) => {
    const el = video.current;
    const barra = regua.current;
    if (!el || !barra || !el.duration) return;
    const r = barra.getBoundingClientRect();
    const parte = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    el.currentTime = parte * el.duration;
    setPosicao(el.currentTime);
  };

  /* mudo é volume zero desenhado: a régua cai para o chão quando o som
     é cortado, em vez de mentir que ainda está em 80% */
  const ajustarVolume = (clientX: number) => {
    const el = video.current;
    const barra = regraVol.current;
    if (!el || !barra) return;
    const r = barra.getBoundingClientRect();
    const parte = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    el.volume = parte;
    el.muted = parte === 0;
    setVolume(parte);
    setMudo(el.muted);
  };

  const andamento = duracao > 0 ? (posicao / duracao) * 100 : 0;
  const nivel = mudo ? 0 : volume * 100;

  return (
    <div className={`vd${tocando ? " vd-tocando" : ""}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted={mudo}
        onVolumeChange={(e) => {
          const el = e.currentTarget;
          setMudo(el.muted);
          setVolume(el.volume);
        }}
        loop
        playsInline
        preload="metadata"
        onClick={alternar}
      />

      {/* o alvo de tocar, grande, no meio da peça */}
      <button
        className="vd-tocar"
        type="button"
        onClick={alternar}
        aria-label={tocando ? `Pausar ${rotulo}` : `Tocar ${rotulo}`}
      >
        <span aria-hidden="true">{tocando ? "❚❚" : "▶"}</span>
      </button>

      <div className="vd-barra">
        <button
          className="vd-botao mono"
          type="button"
          onClick={alternar}
          aria-label={tocando ? "Pausar" : "Tocar"}
        >
          {tocando ? "❚❚" : "▶"}
        </button>

        <span className="vd-tc mono">{tc(posicao)}</span>

        <div
          className="vd-regua"
          ref={regua}
          role="slider"
          tabIndex={0}
          aria-label={`Posição em ${rotulo}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duracao)}
          aria-valuenow={Math.round(posicao)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            buscar(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) buscar(e.clientX);
          }}
          onKeyDown={(e) => {
            const el = video.current;
            if (!el) return;
            if (e.key === "ArrowRight") el.currentTime += 1;
            if (e.key === "ArrowLeft") el.currentTime -= 1;
            if (e.key === " ") {
              e.preventDefault();
              alternar();
            }
          }}
        >
          <i style={{ width: `${andamento}%` }} />
          <b style={{ left: `${andamento}%` }} />
        </div>

        <span className="vd-tc vd-tc-fim mono">{tc(duracao)}</span>

        {/* som: o botão corta e devolve, a régua ao lado ajusta. Mesma
            linguagem da régua de tempo, em tamanho menor. */}
        <div className="vd-som">
          <button
            className="vd-botao mono"
            type="button"
            onClick={() => {
              const el = video.current;
              if (!el) return;
              const cortar = !el.muted;
              el.muted = cortar;
              if (!cortar && el.volume === 0) {
                el.volume = 0.8;
                setVolume(0.8);
              }
              setMudo(cortar);
            }}
            aria-label={mudo ? "Ligar o som" : "Cortar o som"}
          >
            {mudo ? "SOM OFF" : "SOM ON"}
          </button>

          <div
            className="vd-regua vd-regua-som"
            ref={regraVol}
            role="slider"
            tabIndex={0}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(nivel)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              ajustarVolume(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) ajustarVolume(e.clientX);
            }}
            onKeyDown={(e) => {
              const el = video.current;
              if (!el) return;
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const passo = e.key === "ArrowRight" ? 0.08 : -0.08;
                const novo = Math.min(Math.max((mudo ? 0 : el.volume) + passo, 0), 1);
                el.volume = novo;
                el.muted = novo === 0;
                setVolume(novo);
                setMudo(el.muted);
              }
            }}
          >
            <i style={{ width: `${nivel}%` }} />
            <b style={{ left: `${nivel}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
