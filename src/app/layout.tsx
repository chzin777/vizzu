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
import { MARCA, SITE, PROJETOS } from "../dados";

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
  /* Sem `metadataBase` o Next resolve as imagens de compartilhamento em
     localhost, e o link colado no WhatsApp sai sem capa. */
  metadataBase: new URL(SITE),
  title: {
    default: TITULO,
    /* nas páginas de projeto o título vira "Citrine · Vizzu" sozinho */
    template: `%s · ${MARCA.nome}`,
  },
  description: RESUMO,
  applicationName: MARCA.nome,
  authors: [{ name: MARCA.pessoa, url: MARCA.instagram }],
  creator: MARCA.pessoa,
  publisher: MARCA.nome,
  keywords: [
    "editor de vídeo Goiânia",
    "identidade visual",
    "social media",
    "design de marca",
    "motion e edição",
    "portfólio de design",
    MARCA.pessoa,
    MARCA.nome,
  ],
  category: "design",
  alternates: { canonical: "/" },
  openGraph: {
    title: TITULO,
    description: RESUMO,
    type: "website",
    locale: "pt_BR",
    url: SITE,
    siteName: MARCA.nome,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: RESUMO,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
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
        {/* Dados estruturados: quem é, o que faz e quais são os trabalhos.
            É o que faz o resultado de busca mostrar a pessoa e não só o
            título da página — e é também o que um LLM lê primeiro. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE}/#site`,
                  url: SITE,
                  name: MARCA.nome,
                  inLanguage: "pt-BR",
                  description: RESUMO,
                },
                {
                  "@type": "Person",
                  "@id": `${SITE}/#pessoa`,
                  name: MARCA.pessoa,
                  jobTitle: "Editor de vídeo e designer de identidade visual",
                  url: SITE,
                  sameAs: [MARCA.instagram],
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Goiânia",
                    addressRegion: "GO",
                    addressCountry: "BR",
                  },
                  makesOffer: [
                    "Edição e captação de vídeo",
                    "Identidade visual",
                    "Posts para redes sociais",
                  ].map((nome) => ({
                    "@type": "Offer",
                    itemOffered: { "@type": "Service", name: nome },
                  })),
                },
                ...PROJETOS.map((p) => ({
                  "@type": "CreativeWork",
                  "@id": `${SITE}/trabalho/${p.slug}#projeto`,
                  name: p.titulo,
                  url: `${SITE}/trabalho/${p.slug}`,
                  genre: p.tipo,
                  abstract: p.resumo,
                  creator: { "@id": `${SITE}/#pessoa` },
                })),
              ],
            }),
          }}
        />

        <noscript>
          <style>{`.sobe{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
