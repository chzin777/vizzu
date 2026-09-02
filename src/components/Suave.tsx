"use client";

/* Liga a rolagem suave e a classe `js` para a página inteira. Existe
   como componente porque o layout é de servidor e o hook precisa de
   cliente. Não renderiza nada. */

import { useRolagemSuave } from "../lib/anim";

export default function Suave() {
  useRolagemSuave();
  return null;
}
