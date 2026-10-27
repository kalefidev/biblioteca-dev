import { notFound } from "next/navigation";

// Qualquer URL sem rota cai aqui (o proxy põe o idioma na frente), então o 404 usa o layout e o shell do idioma certo.
export const generateStaticParams = () => [{ rest: ["404"] }];

export default function CatchAll() {
  notFound();
}
