import { useEffect } from 'react';

// Injeta JSON-LD (Schema.org) no <head> da página atual. Cria um <script>
// com id único por instância e remove na desmontagem.
//
// Uso típico: <JsonLd id="case-marlene" schema={{ '@context': ..., '@type': 'Article', ... }} />
//
// Pra SPA React Vite, isso é a forma mais simples — sem precisar de helmet
// ou SSR. Crawlers modernos (Googlebot, Bingbot, ChatGPT) executam JS antes
// de extrair o markup, então JSON-LD injetado via JS é indexado.
export default function JsonLd({ id, schema }) {
  useEffect(() => {
    if (!schema || !id) return;
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId);
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);

    return () => {
      const cleanup = document.getElementById(scriptId);
      if (cleanup) cleanup.remove();
    };
  }, [id, schema]);

  return null;
}
