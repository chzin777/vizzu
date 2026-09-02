"use client";

/* ============================================================
   ESPIRAL — a parede de trabalho, enrolada

   As peças sobem numa hélice: cada cartão avança um passo de ângulo e
   um passo de altura, então o olho lê uma coluna girando em vez de uma
   fila. Quem está na frente cresce; quem está na borda desfoca e some.

   Tudo é escrito direto no estilo do elemento dentro do quadro de
   animação — estado do React aqui custaria uma renderização por quadro
   só para mover meia dúzia de cartões.
   ============================================================ */

import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

export interface InfiniteSpiralItem {
  id?: string | number;
  src: string;
  alt?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  label?: string;
}

export interface InfiniteSpiralProps {
  items?: Array<string | InfiniteSpiralItem>;
  speed?: number;
  direction?: 'up' | 'down';
  animationMode?: 'auto' | 'drag' | 'scroll' | 'all';
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  perspective?: number;
  cardsPerTurn?: number;
  rotation?: number;
  cardTilt?: number;
  cardRadius?: number;
  centerScale?: number;
  edgeFade?: number;
  edgeBlur?: number;
  pauseOnHover?: boolean;
  hoverScale?: number;
  hoverWiden?: number;
  imageFit?: CSSProperties['objectFit'];
  grayscale?: number;
  className?: string;
}

type NormalizedItem = InfiniteSpiralItem & { alt: string };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

const InfiniteSpiral = ({
  items = [],
  speed = 0.55,
  direction = 'up',
  animationMode = 'auto',
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  hoverScale = 0.45,
  hoverWiden = 1.9,
  imageFit = 'cover',
  grayscale = 0,
  className = ''
}: InfiniteSpiralProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  /* Qual cartão está sob o ponteiro, e o quanto cada um já cresceu. O
     crescimento é interpolado no mesmo quadro do giro: uma transição de
     CSS aqui brigaria com o transform que o quadro reescreve. */
  const hoveredCardRef = useRef(-1);
  const hoverAmountRef = useRef<number[]>([]);
  /* a proporção real de cada arquivo, lida quando ele termina de
     carregar: é ela que diz o quanto o cartão pode se abrir */
  const aspectosRef = useRef<number[]>([]);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const dragMovedRef = useRef(false);

  const normalizedItems = useMemo<NormalizedItem[]>(
    () =>
      items.map((item, index) =>
        typeof item === 'string'
          ? { src: item, alt: `Spiral image ${index + 1}` }
          : { alt: `Spiral image ${index + 1}`, ...item }
      ),
    [items]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || normalizedItems.length === 0) return;

    let frameId = 0;
    let previousTime = performance.now();
    let bounds = root.getBoundingClientRect();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrollEnabled = animationMode === 'scroll' || animationMode === 'all';
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    let lastScrollY = window.scrollY;
    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect();
    });
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    intersectionObserver.observe(root);

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visibleRef.current || scrollDelta === 0) return;
      targetProgressRef.current += clamp(
        (scrollDelta * scrollSpeedMultiplier) / Math.max(verticalSpacing * 2, 1),
        -1.5,
        1.5
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const autoEnabled = animationMode === 'auto' || animationMode === 'all';
      const motionPaused = draggingRef.current || (pauseOnHover && hoveredRef.current);
      const directionMultiplier = direction === 'down' ? -1 : 1;
      const desiredAutoSpeed =
        autoEnabled && visibleRef.current && !reducedMotion.matches && !motionPaused
          ? speed * directionMultiplier
          : 0;
      const speedBlend = 1 - Math.exp(-delta * 7);
      autoSpeedRef.current += (desiredAutoSpeed - autoSpeedRef.current) * speedBlend;
      targetProgressRef.current += autoSpeedRef.current * delta;

      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 22 : 11));
      progressRef.current += (targetProgressRef.current - progressRef.current) * followBlend;

      const count = normalizedItems.length;
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / (cardWidth * 2.8), height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const cinza = Math.min(1, Math.max(0, grayscale));
      const turnSize = Math.max(cardsPerTurn, 1);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const offset = modulo(index - progressRef.current + half, count) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + rotation;
        const angleRadians = (angle * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        /* o cartão sob o ponteiro cresce, sai do desfoque e vai para a
           frente de todos — a interpolação evita o salto seco */
        const hoverTarget = hoveredCardRef.current === index ? 1 : 0;
        const hoverBlend = 1 - Math.exp(-delta * 12);
        const previousHover = hoverAmountRef.current[index] ?? 0;
        const hover = previousHover + (hoverTarget - previousHover) * hoverBlend;
        hoverAmountRef.current[index] = hover;

        /* Cartão quadrado corta banner no meio. No hover, o que estava
           deitado ABRE até a própria proporção — a peça aparece como foi
           entregue, e não como um recorte dela. O teto existe para uma
           capa muito larga não varrer a coluna inteira. */
        const aspecto = clamp(aspectosRef.current[index] ?? 1, 1, hoverWiden);
        const larguraAlvo = cardWidth * (1 + (aspecto - 1) * hover);
        card.style.width = `${larguraAlvo}px`;

        const visualScale = scale * depthScale * (1 + hoverScale * hover);
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(0.35, 1, edge) * (1 - hover);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${visualScale})`;
        card.style.opacity = Math.min(1, opacity + hover * 0.4).toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index + (hover > 0.01 ? 200000 : 0));
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
        /* o cinza sai junto com o crescimento: a peça sob o ponteiro
           volta a ser a peça, colorida como foi entregue */
        const imagem = card.firstElementChild as HTMLElement | null;
        if (imagem) imagem.style.filter = `grayscale(${(cinza * (1 - hover)).toFixed(3)})`;
      });
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    normalizedItems,
    speed,
    direction,
    animationMode,
    radius,
    perspective,
    cardWidth,
    cardHeight,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    cardTilt,
    centerScale,
    edgeFade,
    edgeBlur,
    pauseOnHover,
    hoverScale,
    hoverWiden,
    grayscale
  ]);

  const rootStyle = {
    perspective: `${perspective}px`,
    '--spiral-width': `${cardWidth}px`,
    '--spiral-height': `${cardHeight}px`,
    '--spiral-radius': `${cardRadius}px`,
    cursor: animationMode === 'drag' || animationMode === 'all' ? 'grab' : 'default',
    touchAction: animationMode === 'drag' || animationMode === 'all' ? 'pan-x' : 'auto',
    userSelect: animationMode === 'drag' || animationMode === 'all' ? 'none' : 'auto'
  } as CSSProperties;

  const dragEnabled = animationMode === 'drag' || animationMode === 'all';

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default';
  };

  const setCardRef = (index: number) => (node: HTMLAnchorElement | HTMLDivElement | null) => {
    cardRefs.current[index] = node;
  };

  const cardHoverHandlers = (index: number) => ({
    onPointerEnter: () => {
      hoveredCardRef.current = index;
    },
    onPointerLeave: () => {
      if (hoveredCardRef.current === index) hoveredCardRef.current = -1;
    }
  });

  const cardStyle: CSSProperties = { width: cardWidth, height: cardHeight, borderRadius: cardRadius };
  /* O cartão é pintado no DOBRO e reduzido pelo CSS. Sem isso a imagem
     é rasterizada no tamanho de repouso e o zoom do hover só estica
     esse mesmo bitmap — que era a papa que aparecia na tela. */
  const imageStyle: CSSProperties = {
    width: '200%',
    height: '200%',
    transform: 'scale(0.5)',
    transformOrigin: 'top left',
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: imageFit,
    filter: `grayscale(${Math.min(1, Math.max(0, grayscale))})`
  };

  const itemClassName =
    'absolute left-1/2 top-1/2 block h-[var(--spiral-height)] w-[var(--spiral-width)] overflow-hidden rounded-[var(--spiral-radius)] border border-white/25 bg-white/10 shadow-[0_14px_38px_rgba(8,6,18,0.2)] [backface-visibility:hidden] [transform-style:preserve-3d] motion-reduce:transition-none';

  return (
    <div
      ref={rootRef}
      className={`relative isolate h-full min-h-80 w-full overflow-visible ${className}`}
      style={rootStyle}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={event => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerYRef.current = event.clientY;
        targetProgressRef.current = progressRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.cursor = 'grabbing';
      }}
      onPointerMove={event => {
        if (!draggingRef.current) return;
        const pointerDelta = event.clientY - lastPointerYRef.current;
        lastPointerYRef.current = event.clientY;
        if (Math.abs(pointerDelta) > 0.5) dragMovedRef.current = true;
        targetProgressRef.current -= pointerDelta / Math.max(verticalSpacing, 1);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={event => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]" role="list" aria-label="Infinite spiral gallery">
        {normalizedItems.map((item, index) => {
          const content = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="absolute inset-0 block h-full w-full select-none object-center"
              src={item.src}
              alt={item.alt}
              loading={index < 6 ? 'eager' : 'lazy'}
              onLoad={event => {
                const img = event.currentTarget;
                if (img.naturalHeight > 0) {
                  aspectosRef.current[index] = img.naturalWidth / img.naturalHeight;
                }
              }}
              draggable={false}
              style={imageStyle}
            />
          );

          return item.href ? (
            <a
              key={item.id ?? `${item.src}-${index}`}
              ref={setCardRef(index)}
              className={itemClassName}
              style={cardStyle}
              href={item.href}
              target={item.target}
              rel={item.target === '_blank' ? 'noreferrer' : undefined}
              role="listitem"
              aria-label={item.label ?? item.alt}
              {...cardHoverHandlers(index)}
            >
              {content}
            </a>
          ) : (
            <div
              key={item.id ?? `${item.src}-${index}`}
              ref={setCardRef(index)}
              className={itemClassName}
              style={cardStyle}
              role="listitem"
              aria-label={item.label ?? item.alt}
              {...cardHoverHandlers(index)}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSpiral;
