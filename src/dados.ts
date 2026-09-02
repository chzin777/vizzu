/* ============================================================
   Conteúdo da página, num arquivo só.

   Trocar texto ou ordem de seção é editar aqui — os componentes não
   guardam texto. As peças do portfólio são a exceção: elas vêm de
   src/portfolio.json, que o script de download escreve.
   ============================================================ */

/* O endereço público. Sai do ambiente quando existir domínio próprio;
   sem isso, o da Vercel. Metadados, sitemap e robots leem daqui — sem um
   endereço absoluto, o Next resolve as imagens de compartilhamento em
   localhost e o link no WhatsApp aparece sem capa. */
export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vizzu-xi.vercel.app";

export const MARCA = {
  nome: "Vizzu",
  pessoa: "Noah Lima Queiroz",
  instagram: "https://www.instagram.com/noahlimaq/",
  /* O canal de fechar trabalho é o WhatsApp: o Instagram continua
     existindo como vitrine, mas botão de CTA que cai numa DM some entre
     as mensagens de pedido de seguir. A mensagem já vai escrita para a
     conversa não começar do zero. */
  telefone: "5562991636639",
  whatsapp:
    "https://wa.me/5562991636639?text=" +
    encodeURIComponent("Oi, Noah! Vim pelo site e quero falar sobre um projeto."),
  arroba: "@noahlimaq",
  portfolio: "https://noahqueiroz91.wixsite.com/portf",
  email: "",
};

export type Area = {
  tc: string;
  nome: string;
  desc: string;
  tags: string[];
};

export const AREAS: Area[] = [
  {
    tc: "A01",
    nome: "Edição e captação",
    desc: "Da filmagem ao corte final: enquadramento, ritmo, cor e som. O corte é montado para segurar nos três primeiros segundos, que é o tempo que a pessoa dá antes de rolar.",
    tags: ["Reels", "YouTube", "Institucional", "Cobertura de evento"],
  },
  {
    tc: "A02",
    nome: "Identidade visual",
    desc: "Logo, paleta, tipografia e as regras de uso. A marca sai reconhecível mesmo cortada pela metade, em preto e branco, ou espremida num avatar de 40 pixels.",
    tags: ["Logo", "Paleta", "Tipografia", "Manual de uso"],
  },
  {
    tc: "A03",
    nome: "Posts para redes",
    desc: "Feed, stories e capa com cara de campanha, não de template. Peça avulsa quando você precisa de uma, ou a linha do mês inteira quando precisa de constância.",
    tags: ["Feed", "Stories", "Carrossel", "Capa"],
  },
];

/* ---------- portfólio ----------

   As peças vêm de src/portfolio.json, gerado por
   `node scripts/baixar-portfolio.mjs`. Aqui fica só o que é editorial:
   o tipo de trabalho e a linha que explica o projeto. Casar pelo slug
   mantém as duas coisas separadas — rodar o script de novo não apaga
   texto escrito à mão. */

import bruto from "./portfolio.json";

export type Peca = {
  tipo: "imagem" | "video";
  src: string;
  capa?: string;
  largura: number;
  altura: number;
};

export type Projeto = {
  slug: string;
  titulo: string;
  tipo: string;
  resumo: string;
  pecas: Peca[];
};

const FICHA: Record<string, { titulo?: string; tipo: string; resumo: string }> = {
  "motos-e-motos": {
    tipo: "Social media e vídeo",
    resumo:
      "Loja de motos: cortes verticais para o feed, capas e peças de campanha. O material de vídeo é gravado e montado para rodar em série, não uma peça por vez.",
  },
  citrine: {
    tipo: "Identidade visual e banners",
    resumo:
      "Marca de joalheria. Tipografia fina sobre preto, dourado como único acento, e a mesma regra aplicada nos banners de loja.",
  },
  "vega-construtora": {
    tipo: "Marca e conteúdo",
    resumo:
      "Construtora: identidade, peças de anúncio e vídeos de obra. O projeto mais longo da lista, com material de feed, banner e reel saindo da mesma direção.",
  },
  "corpo-e-cidade": {
    titulo: "Corpo & Cidade",
    tipo: "Direção de arte",
    resumo:
      "Intervenção artística. Registro e peças gráficas para uma ação de rua: o trabalho em que a imagem carrega o discurso inteiro.",
  },
  "fluid-no-label": {
    titulo: "Fluid / No Label",
    tipo: "Identidade visual",
    resumo:
      "Identidade da linha Fluid, da No Label: marca, aplicação e as regras de uso que fazem a peça continuar reconhecível fora do mockup.",
  },
  tatuzinho: {
    titulo: "Tatuzinho Automóveis",
    tipo: "Identidade visual",
    resumo:
      "Loja de automóveis. Símbolo, tipografia e paleta amarela sobre preto, desenhados para funcionar de fachada a avatar.",
  },
};

export const PROJETOS: Projeto[] = (bruto as Omit<Projeto, "tipo" | "resumo">[])
  .map((p) => {
    const f = FICHA[p.slug];
    if (!f) return null;
    return {
      slug: p.slug,
      titulo: f.titulo ?? p.titulo,
      tipo: f.tipo,
      resumo: f.resumo,
      pecas: p.pecas as Peca[],
    };
  })
  .filter((p): p is Projeto => p !== null);

/* As peças que a parede da capa mostra. Intercaladas entre projetos —
   se fossem em ordem, cada coluna do mural viraria um projeto inteiro e
   o fundo pareceria seis blocos, não um corpo de trabalho.

   Vídeo entra pela capa (o quadro do pôster): dezenas de vídeos tocando
   ao mesmo tempo atrás do título derrubam o primeiro segundo da página,
   que é justamente o que a capa existe para ganhar. */
export const PECAS_CAPA: { image: string; title: string }[] = (() => {
  /* Os arquivos do portfólio são os originais: alguns passam de 4 MB.
     Quarenta deles em tamanho cheio atrás do título fazem exatamente o
     que se viu — ladrilho preto esperando o download. Aqui cada um passa
     pelo otimizador do Next em 640px, que é mais do que o ladrilho usa. */
  const miniatura = (src: string) =>
    `/_next/image?url=${encodeURIComponent(src)}&w=640&q=70`;

  const listas = PROJETOS.map((p) =>
    p.pecas
      .map((peca) => ({
        image: peca.tipo === "video" ? peca.capa : peca.src,
        title: p.titulo,
      }))
      .filter((x): x is { image: string; title: string } => Boolean(x.image))
      .map((x) => ({ ...x, image: miniatura(x.image) })),
  );

  const saida: { image: string; title: string }[] = [];
  const maior = Math.max(...listas.map((l) => l.length));
  for (let i = 0; i < maior; i++) {
    for (const lista of listas) if (lista[i]) saida.push(lista[i]);
  }
  return saida;
})();

/* A espiral da capa: uma seleção curta, não o portfólio inteiro. São
   cartões quadrados de cem pixels girando — peça de banner larga vira
   um borrão ali. Aqui só entra o que sobrevive ao corte no centro:
   foto, cartaz e logo com assunto no meio do quadro.

   Cada cartão leva ao projeto, e passa pelo otimizador em 320px porque
   o cartão nunca usa mais que isso. */
export const ESPIRAL_CAPA: {
  src: string;
  alt: string;
  href: string;
}[] = [
  { arq: "/trabalho/motos-e-motos/13-capa.jpg", alt: "Motos & Motos", slug: "motos-e-motos" },
  { arq: "/trabalho/citrine/03.png", alt: "Citrine", slug: "citrine" },
  { arq: "/trabalho/corpo-e-cidade/05.jpg", alt: "Corpo e Cidade", slug: "corpo-e-cidade" },
  { arq: "/trabalho/vega-construtora/06.png", alt: "Vega Construtora", slug: "vega-construtora" },
  { arq: "/trabalho/tatuzinho/03.png", alt: "Tatuzinho Automóveis", slug: "tatuzinho" },
  { arq: "/trabalho/fluid-no-label/07.png", alt: "Fluid no label", slug: "fluid-no-label" },
  { arq: "/trabalho/citrine/05.png", alt: "Citrine", slug: "citrine" },
].map((p) => ({
  src: `/_next/image?url=${encodeURIComponent(p.arq)}&w=750&q=88`,
  alt: p.alt,
  href: `/trabalho/${p.slug}`,
}));

export type Passo = {
  tc: string;
  nome: string;
  desc: string;
};

export const PASSOS: Passo[] = [
  {
    tc: "00:00",
    nome: "Conversa",
    desc: "Você conta o que precisa aparecer e para quem. Eu pergunto sobre o negócio até entender o que a peça tem que resolver, não só como ela deve ficar.",
  },
  {
    tc: "01:00",
    nome: "Direção",
    desc: "Referência, roteiro e paleta antes de qualquer gravação. A ideia fica decidida no papel; descobrir a ideia na edição é o que faz prazo estourar.",
  },
  {
    tc: "02:00",
    nome: "Execução",
    desc: "Captação, corte, cor e som. Você vê o material no meio do caminho e pede ajuste enquanto ainda é barato mudar.",
  },
  {
    tc: "03:00",
    nome: "Entrega",
    desc: "Arquivos nos formatos de cada rede, com as fontes e as cores anotadas. Você fica com tudo, inclusive o que precisa para a próxima peça.",
  },
];

export const TARJA = [
  "Edição de vídeo",
  "Captação",
  "Identidade visual",
  "Social media",
  "Direção de arte",
  "Motion",
];

/* Os clipes que a barra do topo nomeia enquanto a pessoa rola. A ordem
   é a mesma da página, e o timecode é o ponto de entrada de cada um. */
export const CLIPES = [
  { id: "capa", nome: "Abertura", tc: "00:00:00:00" },
  { id: "trabalho", nome: "Trabalho", tc: "00:00:12:04" },
  { id: "sobre", nome: "Quem é", tc: "00:00:38:16" },
  { id: "servicos", nome: "O que eu faço", tc: "00:01:02:10" },
  { id: "processo", nome: "Como funciona", tc: "00:01:30:08" },
  { id: "contato", nome: "Falar comigo", tc: "00:02:02:08" },
];
