/* ============================================================
   RODAPÉ

   Componente de servidor: não tem estado nem movimento. O olho da
   marca fecha a página no mesmo lugar em que a abriu.

   Estrutura em duas alturas: em cima, a marca com a frase e o convite
   de conversa ao lado de duas colunas de navegação; embaixo, a linha
   fina com ano, autoria e crédito de quem fez o site. O rodapé antigo
   era uma fileira de links soltos — não fechava a página, só parava.
   ============================================================ */

import Link from "next/link";
import { MARCA } from "../dados";

const NAVEGAR = [
  { href: "/#sobre", texto: "Quem é" },
  { href: "/#servicos", texto: "O que eu faço" },
  { href: "/#trabalho", texto: "Trabalho" },
  { href: "/#processo", texto: "Como funciona" },
  { href: "/#contato", texto: "Falar comigo" },
];

export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rodape" id="rodape">
      <div className="rodape-topo">
        {/* a marca e a frase: é o bloco que fecha o argumento da página */}
        <div className="rodape-marca">
          <span className="rodape-logo" role="img" aria-label={MARCA.nome} />
          <p className="rodape-frase">
            Design não é só sobre ser bonito.
            <br />É sobre ser impossível de ignorar.
          </p>
          <a
            className="botao rodape-botao"
            href={MARCA.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Começar uma conversa
          </a>
        </div>

        <nav className="rodape-coluna" aria-label="Seções do site">
          <h2 className="rodape-titulo mono">Navegar</h2>
          <ul className="rodape-lista">
            {NAVEGAR.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.texto}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rodape-coluna">
          <h2 className="rodape-titulo mono">Onde me achar</h2>
          <ul className="rodape-lista">
            <li>
              <a href={MARCA.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={MARCA.instagram} target="_blank" rel="noreferrer">
                Instagram {MARCA.arroba}
              </a>
            </li>
            <li>
              <a href={MARCA.portfolio} target="_blank" rel="noreferrer">
                Portfólio antigo
              </a>
            </li>
            <li>
              <a href="#capa">Voltar ao topo</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="rodape-base">
        <p className="rodape-nota mono">
          Feito pela{" "}
          <a
            className="rodape-credito"
            href="https://comply.website"
            target="_blank"
            rel="noreferrer"
          >
            Comply
          </a>
        </p>
        <p className="rodape-nota mono">
          © {ano} {MARCA.nome} · {MARCA.pessoa}
        </p>
      </div>
    </footer>
  );
}
