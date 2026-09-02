/* ============================================================
   TEMAS POR PROJETO

   Cada projeto tem uma página própria, e essa página VESTE o projeto:
   o fundo, o acento e a fonte de manchete passam a ser os da marca que
   foi desenhada ali. O menu, o rodapé e os botões herdam tudo, porque
   são todos escritos em cima das mesmas variáveis.

   É o argumento do site inteiro dito na prática: se ele desenha
   identidade visual, o site tem que ser capaz de vestir uma.

   As cores vêm das próprias peças (o amarelo do Tatuzinho, o dourado
   da Citrine, o azul da Vega). A fonte de manchete é escolhida pelo
   caráter da marca, não por variedade: condensada pesada para as de
   rua, serifada alta para a de joalheria, geométrica para as de
   construção e produto.
   ============================================================ */

export type Tema = {
  /* fundo da página e das seções escuras */
  fundo: string;
  /* uma nota acima do fundo, para cartões e faixas */
  superficie: string;
  /* cor de texto principal */
  tinta: string;
  /* o acento: faixas, rótulos, botões */
  acento: string;
  /* o mesmo acento escurecido, para tipo sobre fundo claro */
  acentoTipo: string;
  /* preto ou branco: o que lê por cima do acento */
  sobreAcento: string;
  /* qual das fontes de manchete carregadas no layout */
  display: string;
  /* peso e largura do eixo variável da manchete */
  peso: number;
  largura: string;
  /* uma linha sobre a escolha, para quem for mexer depois */
  nota: string;
};

export const TEMAS: Record<string, Tema> = {
  "motos-e-motos": {
    fundo: "#0b0708",
    superficie: "#160d0f",
    tinta: "#ffffff",
    acento: "#e5202a",
    acentoTipo: "#b3141c",
    sobreAcento: "#ffffff",
    display: "var(--f-oswald)",
    peso: 700,
    largura: "100%",
    nota: "Vermelho de oficina e condensada de placa: a marca grita de longe, que é o que uma loja de beira de avenida precisa.",
  },
  citrine: {
    fundo: "#0a0908",
    superficie: "#151210",
    tinta: "#f6f1e8",
    acento: "#d9a441",
    acentoTipo: "#8a6416",
    sobreAcento: "#0a0908",
    display: "var(--f-playfair)",
    peso: 800,
    largura: "100%",
    nota: "Dourado sobre preto e serifada de alto contraste: joalheria pede haste fina, não peso.",
  },
  "vega-construtora": {
    fundo: "#060c17",
    superficie: "#0d1626",
    tinta: "#eef3fb",
    acento: "#2f6bff",
    acentoTipo: "#1a4bc9",
    sobreAcento: "#ffffff",
    display: "var(--f-space)",
    peso: 700,
    largura: "100%",
    nota: "Azul de planta e grotesca geométrica: construtora vende confiança e medida, não emoção.",
  },
  "corpo-e-cidade": {
    fundo: "#100708",
    superficie: "#1c0c0e",
    tinta: "#fdf6f4",
    acento: "#e1251b",
    acentoTipo: "#a3140d",
    sobreAcento: "#ffffff",
    display: "var(--f-syne)",
    peso: 800,
    largura: "100%",
    nota: "Vermelho de cartaz de rua e display torta: intervenção artística não pode parecer institucional.",
  },
  "fluid-no-label": {
    fundo: "#05070f",
    superficie: "#0b1020",
    tinta: "#f2f6ff",
    acento: "#4b7bff",
    acentoTipo: "#2a55cc",
    sobreAcento: "#ffffff",
    display: "var(--f-sora)",
    peso: 700,
    largura: "100%",
    nota: "Azul líquido e sans de cantos macios: a linha é de produto novo, e produto novo não usa tipo de jornal.",
  },
  tatuzinho: {
    fundo: "#0a0a0a",
    superficie: "#141414",
    tinta: "#ffffff",
    acento: "#f5c518",
    acentoTipo: "#8c6d00",
    sobreAcento: "#0a0a0a",
    display: "var(--f-archivo)",
    peso: 800,
    largura: "68%",
    nota: "Amarelo de sinalização sobre preto, com a mesma condensada da casa: é a marca que mais se parece com a Vizzu.",
  },
};

/* O tema da própria Vizzu. Serve de padrão e de volta para casa: a
   página de projeto sai dele e volta para ele quando a pessoa sobe de
   novo para a home. */
export const TEMA_CASA: Tema = {
  fundo: "#0a0a0a",
  superficie: "#141414",
  tinta: "#ffffff",
  acento: "#f57c1f",
  acentoTipo: "#b3540a",
  sobreAcento: "#0a0a0a",
  display: "var(--f-archivo)",
  peso: 800,
  largura: "68%",
  nota: "O laranja da logo, com a condensada variável no eixo estreito.",
};

/** As variáveis que um tema escreve. Usado com `style` no container. */
export function varsDoTema(t: Tema): React.CSSProperties {
  return {
    "--preto": t.fundo,
    "--carvao": t.superficie,
    "--fumaca": t.superficie,
    "--tinta": t.tinta,
    "--laranja": t.acento,
    "--laranja-vivo": t.acento,
    "--laranja-tipo": t.acentoTipo,
    "--sobre-acento": t.sobreAcento,
    "--font-display": t.display,
    "--display-peso": String(t.peso),
    "--display-largura": t.largura,
  } as React.CSSProperties;
}
