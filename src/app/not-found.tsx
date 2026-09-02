import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Rodape from "../components/Rodape";
import Suave from "../components/Suave";
import { MARCA, PROJETOS } from "../dados";

/* ============================================================
   404

   Um endereço errado não devolve tela de servidor: devolve a mesma
   página do site, com a mesma voz. O timecode continua a piada da ilha
   de edição — este é o quadro que não existe na sequência.

   E como quase todo 404 vem de link velho de projeto, a saída não é só
   "voltar ao início": os seis projetos ficam listados aqui mesmo.
   ============================================================ */

export const metadata: Metadata = {
  title: "Quadro não encontrado",
  description: "Esse endereço não existe no corte final.",
  robots: { index: false, follow: true },
};

export default function NaoEncontrado() {
  return (
    <>
      <Suave />
      <Nav />

      <main className="erro">
        <p className="clipe mono">00:00:00:00 · Fora da sequência</p>

        <h1 className="erro-codigo display">404</h1>

        <p className="erro-frase display">
          Esse quadro não existe <em className="serifa laranja">no corte</em>
        </p>

        <p className="erro-texto">
          O endereço mudou ou nunca existiu. O trabalho continua onde sempre
          esteve — escolhe por onde entrar.
        </p>

        <div className="capa-acoes erro-acoes">
          <Link className="botao" href="/">
            Voltar para o início
          </Link>
          <a
            className="botao botao-vazado"
            href={MARCA.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Chamar no WhatsApp
          </a>
        </div>

        <ul className="erro-lista">
          {PROJETOS.map((p) => (
            <li key={p.slug}>
              <Link href={`/trabalho/${p.slug}`}>
                <span className="erro-lista-nome display">{p.titulo}</span>
                <span className="mono">{p.tipo} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Rodape />
      <div className="grao" aria-hidden="true" />
    </>
  );
}
