import type { MetadataRoute } from "next";
import { SITE } from "../dados";

/* ============================================================
   robots.txt

   O site inteiro é público e deve ser indexado: são seis projetos e uma
   página de apresentação, e o objetivo do portfólio é justamente ser
   encontrado. Só a rota do otimizador de imagem fica de fora — ela
   serve o mesmo arquivo que já está em /trabalho, com outra URL, e
   indexar as duas divide o mesmo conteúdo em duas entradas.
   ============================================================ */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/_next/image"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
