import { getMoradores } from "./_data-access/get-moradores";
import { MoradoresContent } from "./_components/moradores-content";

/**
 * Spec 02/03 - cadastro, edicao, redefinicao de senha e desativacao de
 * moradores pelo administrativo.
 */
export default async function MoradoresPage() {
  const moradores = await getMoradores();

  return <MoradoresContent moradores={moradores} />;
}
