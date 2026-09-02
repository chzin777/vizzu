"use client";

/* ============================================================
   NAVEGAÇÃO

   Transparente sobre a capa e opaca depois dela. A troca acontece por
   classe, não por estilo em linha, para que a transição fique no CSS.
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { irParaTopo, pausarRolagem } from "../lib/anim";
import { MARCA } from "../dados";
import { useCortina } from "../lib/cortina";

/* Com barra na frente: o menu tem que funcionar também nas páginas de
   projeto, onde uma âncora solta não sairia do lugar. Na home, o mesmo
   endereço é tratado como âncora pelo Lenis e rola suave. */
const LINKS = [
  { href: "/#sobre", texto: "Quem é" },
  { href: "/#servicos", texto: "O que eu faço" },
  { href: "/#trabalho", texto: "Trabalho" },
  { href: "/#processo", texto: "Como funciona" },
];

export default function Nav() {
  const [grudou, setGrudou] = useState(false);
  /* qual seção está sendo lida agora; o item do menu correspondente
     fica sublinhado sem precisar do ponteiro */
  const [secao, setSecao] = useState("");
  /* o menu de celular: no lugar de esconder a navegação inteira abaixo
     de 900px, ela vira uma gaveta de tela cheia */
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();
  const irCom = useCortina();

  useEffect(() => {
    const olhar = () => setGrudou(window.scrollY > 40);
    olhar();
    window.addEventListener("scroll", olhar, { passive: true });
    return () => window.removeEventListener("scroll", olhar);
  }, []);

  /* A seção ativa é a que cruza a LINHA DE LEITURA, a 42% da altura da
     tela. Um IntersectionObserver por seção daria duas ativas ao mesmo
     tempo quando uma é curta e a outra é longa; a linha nunca dá empate.

     Fora da home não há seções para observar, e o menu fica sem marca. */
  useEffect(() => {
    if (caminho !== "/") {
      setSecao("");
      return;
    }
    const ids = LINKS.map((l) => l.href.split("#")[1]);
    const olhar = () => {
      const linha = window.innerHeight * 0.42;
      let atual = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= linha && r.bottom > linha) atual = id;
      }
      setSecao(atual);
    };
    olhar();
    window.addEventListener("scroll", olhar, { passive: true });
    window.addEventListener("resize", olhar);
    return () => {
      window.removeEventListener("scroll", olhar);
      window.removeEventListener("resize", olhar);
    };
  }, [caminho]);

  /* Gaveta aberta trava a rolagem por trás — as duas travas, como na
     abertura: a classe no <html> para o toque e o Lenis, que aplica a
     posição por script e ignora `overflow: hidden`. */
  useEffect(() => {
    if (!aberto) return;
    /* `overflow: hidden` no <html> zerava a rolagem em alguns
       navegadores: a gaveta abria e a página saltava para o topo, o que
       lia como se o botão levasse de volta à capa. Aqui só o Lenis é
       parado, e o toque é barrado no próprio painel. */
    pausarRolagem(true);
    const comEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", comEsc);
    return () => {
      pausarRolagem(false);
      window.removeEventListener("keydown", comEsc);
    };
  }, [aberto]);

  /* trocar de página fecha a gaveta */
  useEffect(() => setAberto(false), [caminho]);

  return (
    <>
      <header className={`nav${grudou ? " grudou" : ""}${aberto ? " nav-aberto" : ""}`}>
      <Link
        className="nav-marca"
        href="/"
        aria-label={`${MARCA.nome} · início`}
        /* Já na home o link não tem para onde ir: ali o clique vira volta
           ao topo, que é o que se espera de uma logo. Fora dela, é
           navegação normal para a home. */
        onClick={(e) => {
          if (caminho === "/") {
            e.preventDefault();
            irParaTopo();
            return;
          }
          irCom(e, "/", "#f57c1f");
        }}
      >
        {/* A logo é pintada por MÁSCARA e não servida como imagem
            colorida: assim ela herda o acento do tema, e nas páginas de
            projeto a marca da casa aparece na cor daquele projeto. */}
        <span className="marca-logo" aria-hidden="true" />
      </Link>

      <nav className="nav-links mono" aria-label="Seções">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={secao && l.href.endsWith(`#${secao}`) ? "ativo" : undefined}
            aria-current={secao && l.href.endsWith(`#${secao}`) ? "true" : undefined}
            /* dentro de um projeto, ir para uma seção da home é troca de
               página: ganha a cortina. Na própria home é só âncora. */
            onClick={(e) => {
              if (caminho === "/") return;
              irCom(e, l.href, "#f57c1f");
            }}
          >
            {l.texto}
          </Link>
        ))}
      </nav>

      <a
        className="botao nav-botao"
        href={MARCA.whatsapp}
        target="_blank"
        rel="noreferrer"
      >
        Falar comigo
      </a>

      {/* o botão da gaveta, só no celular */}
      <button
        className="nav-hamburguer"
        type="button"
        aria-expanded={aberto}
        aria-controls="nav-gaveta"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        onClick={() => setAberto((v) => !v)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      </header>

      {/* A gaveta mora FORA do <header> de propósito: a barra ganha
          `backdrop-filter` quando gruda, e filtro cria bloco de contenção
          para filho `position: fixed` — dentro dela, a gaveta virava uma
          tira de 58px colada no topo e a página aparecia por baixo. */}
    <div className="nav-gaveta" id="nav-gaveta" hidden={!aberto}>
      {/* Uma LISTA, não um cartaz: cada seção é uma linha com número,
          nome e seta, separada por fio. Empilhado em texto grande no
          meio da tela, o menu lia como mais uma seção do site. */}
      <nav className="nav-gaveta-links" aria-label="Seções">
        {LINKS.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={(e) => {
              setAberto(false);
              if (caminho === "/") return;
              irCom(e, l.href, "#f57c1f");
            }}
          >
            <span className="mono nav-gaveta-num">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="nav-gaveta-nome">{l.texto}</span>
            <span className="nav-gaveta-seta" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </nav>

      <a
        className="botao nav-gaveta-botao"
        href={MARCA.whatsapp}
        target="_blank"
        rel="noreferrer"
        onClick={() => setAberto(false)}
      >
        Chamar no WhatsApp
      </a>

      <p className="mono nav-gaveta-pe">
        {MARCA.pessoa} · {MARCA.arroba}
      </p>
    </div>
    </>
  );
}
