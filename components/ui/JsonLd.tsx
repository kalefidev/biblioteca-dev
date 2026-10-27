// Único uso de dangerouslySetInnerHTML além do script de tema: JSON-LD precisa de texto cru dentro do <script>.
// O `<` é escapado para que nenhum campo (inclusive vindo de GitHub/npm) feche a tag.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }} />
}
