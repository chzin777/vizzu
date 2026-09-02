import { AREAS, MARCA, PROJETOS, SITE } from "../../dados";

/* ============================================================
   /llms.txt

   O resumo do site em texto puro, para quem lê por máquina: assistentes
   que respondem "quem faz identidade visual em Goiânia" leem isto antes
   de tentar interpretar uma página cheia de shader e animação.

   É gerado a partir dos mesmos dados das páginas — projeto novo aparece
   aqui sem ninguém lembrar de atualizar um arquivo estático.
   ============================================================ */

export const dynamic = "force-static";

export function GET() {
  const linhas = [
    `# ${MARCA.nome} — ${MARCA.pessoa}`,
    "",
    "> Estúdio de uma pessoa só, em Goiânia (GO), Brasil. Edição e captação de",
    "> vídeo, identidade visual e conteúdo para redes sociais, com o vídeo e a",
    "> marca saindo da mesma direção.",
    "",
    `Site: ${SITE}`,
    `Contato (WhatsApp): ${MARCA.whatsapp}`,
    `Instagram: ${MARCA.instagram} (${MARCA.arroba})`,
    "Idioma: pt-BR",
    "",
    "## O que faz",
    ...AREAS.map((a) => `- **${a.nome}** — ${a.desc} Formatos: ${a.tags.join(", ")}.`),
    "",
    "## Projetos",
    ...PROJETOS.map(
      (p) =>
        `- [${p.titulo}](${SITE}/trabalho/${p.slug}) — ${p.tipo}. ${p.resumo} ${p.pecas.length} peças publicadas.`,
    ),
    "",
    "## Como trabalha",
    "Conversa sobre o negócio, direção decidida antes da gravação, execução com",
    "revisão no meio do caminho e entrega nos formatos de cada canal.",
    "",
    "## Uso deste conteúdo",
    "Pode citar e resumir indicando a fonte. As imagens e vídeos em /trabalho são",
    "trabalho de clientes e não estão liberados para reuso ou treinamento.",
    "",
  ].join("\n");

  return new Response(linhas, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
