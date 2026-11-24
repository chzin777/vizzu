# Vizzu — Portfólio audiovisual

Site-portfólio da **Vizzu** (Noah Lima Queiroz): vitrine de trabalhos em vídeo, página individual por projeto e contato direto pelo WhatsApp.

**Produção:** https://vizzu-xi.vercel.app

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- GSAP + Lenis (animações e rolagem suave)
- Three.js / `@react-three/fiber` (fundos animados: `Silk`, `InfiniteSpiral`)

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

Sem variáveis de ambiente — o site é estático.

## Estrutura

```
src/
  app/
    page.tsx                 home (abertura, manifesto, trabalhos, processo, serviços, contato)
    trabalho/[slug]/page.tsx página de cada projeto do portfólio
    sitemap.ts, robots.ts    SEO
    llms.txt/route.ts        resumo do site para buscadores de IA
  components/                seções e efeitos visuais
  dados.ts                   marca, contatos, textos e mensagem padrão do WhatsApp
  portfolio.json             lista de trabalhos (título, slug, vídeos, capa)
  temas.ts                   paletas por projeto
scripts/
  baixar-portfolio.mjs       baixa mídias do portfólio para /public
  recortar-logo.mjs          gera recortes do logo
```

## Editando o conteúdo

- **Dados da marca e contato:** `src/dados.ts`
- **Projetos do portfólio:** `src/portfolio.json` (cada item vira uma rota `/trabalho/<slug>`)

## Deploy

Vercel (configuração em `vercel.json`); cada push na `main` publica automaticamente.
