/* ============================================================
   A sequência da página, na ordem em que o playhead a percorre.

   As tarjas separam os blocos e trocam de cor junto com o fundo: a
   laranja fecha o preto, a clara fecha o branco. É o que dá a
   sensação de corte entre cenas.
   ============================================================ */

import Abertura from "../components/Abertura";
import Suave from "../components/Suave";
import Playhead from "../components/Playhead";
import Nav from "../components/Nav";
import Capa from "../components/Capa";
import Manifesto from "../components/Manifesto";
import Servicos from "../components/Servicos";
import Trabalho from "../components/Trabalho";
import Processo from "../components/Processo";
import Contato from "../components/Contato";
import Rodape from "../components/Rodape";

export default function Home() {
  return (
    <>
      <Abertura />
      <Suave />
      <Playhead />
      <Nav />

      <main>
        <Capa />
        {/* O trabalho vem antes da conversa: quem abre um portfólio quer
            ver peça, não ler apresentação. O texto sobre ele entra
            depois, quando já há motivo para lê-lo. */}
        <Trabalho />
        <Manifesto />
        <Servicos />
        <Processo />
        <Contato />
      </main>

      <Rodape />
      <div className="grao" aria-hidden="true" />
    </>
  );
}
