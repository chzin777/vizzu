import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROJETOS, MARCA } from "../../../dados";
import ProjetoPagina from "../../../components/ProjetoPagina";

/* ============================================================
   /trabalho/<projeto>

   Uma página por projeto, montada no build: são seis, todas conhecidas,
   e nenhuma depende de requisição. `generateStaticParams` faz as seis
   virarem HTML estático.
   ============================================================ */

export function generateStaticParams() {
  return PROJETOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/trabalho/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const projeto = PROJETOS.find((p) => p.slug === slug);
  if (!projeto) return {};

  const titulo = `${projeto.titulo} · ${MARCA.nome}`;
  return {
    title: projeto.titulo,
    description: projeto.resumo,
    alternates: { canonical: `/trabalho/${slug}` },
    openGraph: {
      title: titulo,
      url: `/trabalho/${slug}`,
      description: projeto.resumo,
      type: "article",
      locale: "pt_BR",
      images: [projeto.pecas[0]?.capa ?? projeto.pecas[0]?.src ?? ""],
    },
  };
}

export default async function Pagina({ params }: PageProps<"/trabalho/[slug]">) {
  const { slug } = await params;
  const i = PROJETOS.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();

  /* o próximo da lista, em círculo: a página nunca termina num beco */
  const proximo = PROJETOS[(i + 1) % PROJETOS.length];

  return <ProjetoPagina projeto={PROJETOS[i]} proximo={proximo} />;
}
