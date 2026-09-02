import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Fredoka,
  Oswald,
  Playfair_Display,
  Sora,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import "./globals.css";
import { MARCA } from "../dados";

/* ============================================================
   TIPOGRAFIA

   Duas camadas. A primeira é a voz da casa: Archivo no eixo estreito e
   peso 800 para manchete, Instrument Serif itálica para UMA palavra por
   frase, Inter Tight no texto corrido em tudo, inclusive rótulos e timecodes.

   A segunda camada existe por causa das páginas de projeto: cada
   projeto veste a própria marca, e marca sem tipografia própria é só
   troca de cor. Então as manchetes de cada projeto rodam numa fonte
   diferente, escolhida pelo caráter da marca — a escolha e o porquê
   moram em src/temas.ts.

   Archivo tem os maiúsculos acentuados, o que numa página em português
   não é detalhe: com Anton, "NÃO" saía "NAO" e "É SÓ" saía "E SO".
   ============================================================ */

const display = Archivo({
  variable: "--f-archivo",
  axes: ["wdth"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/* A palavra de destaque roda na Fredoka: arredondada, cheia e com o
   mesmo desenho gordo das letras da logo. A serifada italiana que
   estava aqui era bonita e falava outra língua — a marca é redonda. */
/* A FONTE DA CASA. Arredondada e cheia, no mesmo desenho das letras da
   logo: a página inteira passa a falar como a marca, e não só a palavra
   de destaque. Archivo continua carregada porque é a manchete de um dos
   projetos (Tatuzinho), que veste a própria tipografia. */
const casa = Fredoka({
  variable: "--f-fredoka",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

/* ---------- as manchetes emprestadas aos projetos ---------- */

const oswald = Oswald({
  variable: "--f-oswald",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--f-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const space = Space_Grotesk({
  variable: "--f-space",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const syne = Syne({
  variable: "--f-syne",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--f-sora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const FONTES = [display, casa, oswald, playfair, space, syne, sora]
  .map((f) => f.variable)
  .join(" ");

const TITULO = `${MARCA.nome} · ${MARCA.pessoa}`;
const RESUMO =
  "Edição e captação de vídeo, identidade visual e posts para redes sociais. Design não é só sobre ser bonito, é sobre ser impossível de ignorar.";

export const metadata: Metadata = {
  title: TITULO,
  description: RESUMO,
  openGraph: {
    title: TITULO,
    description: RESUMO,
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

/* A classe `js` sai do servidor junto com as variáveis de fonte.
   Escrevê-la pelo script no cliente causava divergência de hidratação:
   o React compara o `className` do <html> e via um valor diferente do
   que serviu. Quem estiver sem script cai no <noscript> e vê tudo. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`js ${FONTES}`}>
      <body>
        <noscript>
          <style>{`.sobe{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
