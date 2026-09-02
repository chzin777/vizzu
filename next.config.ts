import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* O StrictMode monta cada componente duas vezes em desenvolvimento.
     Para React puro isso é inofensivo, mas o <Canvas> do R3F cria um
     contexto WebGL na primeira montagem e o navegador o DERRUBA quando
     a segunda chega — o console dizia "THREE.WebGLRenderer: Context
     Lost" e o herói ficava branco. Em produção o problema não existia;
     desligar aqui faz o desenvolvimento mostrar o que o site mostra. */
  reactStrictMode: false,

  /* O otimizador só aceita as qualidades declaradas: pedir q=88 sem
     esta lista devolve 400, e a espiral do herói ficava sem imagem
     nenhuma. 75 é o padrão; 88 é o que os cartões usam, porque eles
     crescem no hover e o artefato de compressão aparece. */
  images: {
    qualities: [75, 88],
  },
};

export default nextConfig;
