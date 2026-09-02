import type { MetadataRoute } from "next";
import { PROJETOS, SITE } from "../dados";

/* ============================================================
   sitemap.xml

   A home e uma entrada por projeto. A lista sai de PROJETOS, então
   projeto novo entra no mapa sozinho — mapa escrito à mão é mapa que
   envelhece no primeiro trabalho entregue.
   ============================================================ */

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return [
    {
      url: SITE,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...PROJETOS.map((p) => ({
      url: `${SITE}/trabalho/${p.slug}`,
      lastModified: agora,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
