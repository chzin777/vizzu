/* ============================================================
   RODAPÉ

   Componente de servidor: não tem estado nem movimento. O olho da
   marca fecha a página no mesmo lugar em que a abriu.
   ============================================================ */

import { MARCA } from "../dados";

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-linha">
        <span className="rodape-logo" role="img" aria-label={MARCA.nome} />
        <div className="rodape-links mono">
          <a href={MARCA.instagram} target="_blank" rel="noreferrer">
            Instagram {MARCA.arroba}
          </a>
          <a href={MARCA.portfolio} target="_blank" rel="noreferrer">
            Portfólio
          </a>
          <a href="#capa">Voltar ao topo</a>
        </div>
      </div>

      <div className="rodape-linha">
        <p className="rodape-nota mono">
          {MARCA.nome} · {MARCA.pessoa}
        </p>
        <p className="rodape-nota mono">
          Design não é só sobre ser bonito
        </p>
      </div>
    </footer>
  );
}
