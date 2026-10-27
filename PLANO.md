# Plano: Biblioteca de ferramentas dev (catálogo profissional + modo 3D)

## Context
Hoje existe um protótipo (Vite + React + R3F, em `Biblioteca interativa/`): galáxia 3D com 64 ferramentas em 8 categorias, busca simples e painel de detalhe. Funciona, mas é um **brinquedo visual**, não uma biblioteca: sem filtros reais, sem páginas por ferramenta, sem SEO, sem métricas, sem identidade profissional.

Objetivo: virar uma "biblioteca de bibliotecas" fácil de achar, bem dividida e intuitiva para devs do mundo todo (idioma fica para depois, mas a estrutura já nasce preparada).

**Decisões já tomadas (com o usuário):**
1. **2D é a interface principal; o 3D vira o modo "Explorar".** Motivo: 3D é ruim para ler, comparar e filtrar muitos itens; é ótimo como entrada de impacto.
2. **Dados curados à mão + enriquecidos por API** (GitHub/npm: estrelas, versão, licença, último commit). Sem banco por enquanto.
3. **Migrar para Next.js (App Router)** para ter página indexável por ferramenta/categoria, metadata, sitemap, deploy na Vercel.

**Premissas a lembrar:** descrições e URLs das 64 ferramentas atuais foram escritas de memória e **não foram verificadas**. Projeto ainda **não é um repositório git**.

## Protocolo de handoff (você dá /clear entre etapas)
O contexto some no `/clear`, então este arquivo é a fonte da verdade.
- **Etapa 0 copia este plano para `PLANO.md` na raiz do projeto** (e cria `CLAUDE.md` curto do projeto apontando para ele + regras de design). Daí em diante, cada nova sessão lê `PLANO.md`, vê o checklist e executa só a próxima etapa.
- **Ao fim de cada etapa:** marcar `[x]` no checklist do `PLANO.md`, anotar em "Decisões/Desvios" o que mudou, rodar a verificação, e só então você dá `/clear`.
- Cada etapa é pensada para caber numa sessão e deixar o site **funcionando** (nunca quebrado no meio).

### Checklist
- [x] 0. Fundação (Next.js + tokens + git)
- [x] 1. Dados (schema, validação, enriquecimento por API)
- [x] 2. Design system e shell do site
- [x] 3. Catálogo: busca, filtros e páginas de categoria
- [x] 4. Página da ferramenta, comparar e "Minha stack"
- [x] 5. Modo Explorar 3D
- [x] 6. Polimento, motion e acessibilidade
- [~] 7. Segurança, SEO e publicação (código pronto; falta publicar, ver "Etapa 7" em Decisões)
- [ ] 8. (Depois) Idiomas e crescimento

## O que do Obsidian entra e onde
| Nota do vault | Como é usada | Etapa |
|---|---|---|
| `design/regras-visuais` | Sem branco/preto 100%; mais espaço em branco; escala tipográfica; alinhamento óptico; poucas cores com variações; grid; line-height curto nos títulos | 2 |
| `design/leis-ux` | Mapa lei → recurso (tabela abaixo) | 2, 3, 4 |
| `design/referencias-ui` | Referências visuais para tirar "cara de vibecode": refero, 21st.dev, magicui, cult-ui, unlumen, smoothui, retroui, shadergradient. Abrir 3-4 com Playwright e extrair padrões antes de desenhar | 2 |
| `design/escolha-animacao` | **Um** lib de animação por projeto: CSS para hover/fade, **Motion** para UI React, Three/R3F para 3D. **Sem GSAP** (brigaria com Motion pelo `transform`; só entra se surgir scroll complexo) | 5, 6 |
| `design/site-cinematografico` | Só a ideia de "entrada impactante" na home (3D com mouse tracking). Fluxo de vídeo (Flow/Seedance) fica **fora**: o site é clicável | 5 |
| `design/motion-video` | Fora do escopo agora (pode servir depois para um vídeo de divulgação 9:16) | — |
| `seguranca/antes-de-publicar` + `depois-de-publicar` | Checklist adaptada (site estático, sem login/banco) | 7 |
| `infra/hospedagem` | Vercel como padrão (casa com Next.js); Cloudflare na frente se precisar de rate limit/WAF; as outras só se houver motivo | 7 |
| `agentes/scope-prompt` | Não se aplica a este site. Só aproveito o formato (situação, contexto, objetivo, parâmetros, exemplos) para estruturar cada etapa | todas |

### Leis de UX → recursos
- **Hick** (menos escolhas): filtros em camadas (principais visíveis, avançados recolhidos), no máx. ~7 categorias na barra principal.
- **Miller** (7±2): agrupar categorias em "famílias"; cards com no máx. 3 metadados visíveis; comparar até 3.
- **Fitts**: busca grande no topo, alvos de clique amplos, filtros em drawer no mobile ao alcance do polegar.
- **Jakob** (padrões familiares): sidebar de facetas como npm/GitHub, `Cmd/Ctrl+K`, grade/lista, breadcrumbs.
- **Von Restorff**: um único acento de cor para "destaque/recomendado"; resto neutro.
- **Zeigarnik**: "Minha stack" fica incompleta de propósito (slots por categoria) e convida a completar.
- **Gradiente de meta**: barra "sua stack: 4 de 8 áreas" ao montar a stack.

---

## Etapa 0: Fundação
**Objetivo:** projeto Next.js rodando com o protótipo preservado, git e documentação do plano.
- `create-next-app` (App Router, TS, Tailwind v4, ESLint) no lugar do Vite. Consultar docs atuais via context7 antes (versão do Next/Tailwind mudou).
- Reaproveitar: `src/data.ts` (dados), `src/Scene.tsx` (cena 3D) → mover para `components/explore/` sem alterar lógica; carregar com `dynamic(..., { ssr: false })`.
- Remover arquivos do Vite e do template. **Usar caminhos explícitos** no `rm` (glob foi bloqueado antes); se bloquear, pedir ao usuário rodar com `!`.
- `git init`, `.gitignore` (inclui `.env*`, `artifacts/`), primeiro commit.
- Criar `PLANO.md` (cópia deste) e `CLAUDE.md` do projeto.
- Porta 3000 (AGENTS.md exige verificação visual em localhost:3000).
**Verificação:** `npm run build` ok; protótipo 3D abre em `/explore` igual ao de hoje; screenshot em `artifacts/`.

## Etapa 1: Dados
**Objetivo:** modelo de dados à altura de uma biblioteca e pipeline de enriquecimento.
- **Schema** (zod, `lib/schema.ts`): `slug`, `name`, `tagline` (1 linha), `description`, `category`, `subcategory`, `kind` (biblioteca | framework | CLI | serviço | app | linguagem), `pricing` (grátis | open source | freemium | pago), `license`, `platforms` (web, desktop, mobile, cli, cloud), `languages`, `tags`, `url`, `repo`, `npm`, `featured`, `alternatives[]` (slugs).
- Campos de métrica (preenchidos pelo script): `stars`, `version`, `lastCommit`, `weeklyDownloads`, `updatedAt`.
- **Dividir em arquivos por categoria** (`data/tools/*.json`) para escalar além de 150 itens.
- Textos de UI e de conteúdo já estruturados para i18n futuro: UI em `messages/pt-BR.ts` (nada de string solta em componente). Conteúdo continua em um idioma agora.
- **Script `scripts/validate.ts`:** slugs únicos, categorias válidas, `alternatives` existem, URL bem formada. Roda no build.
- **Script `scripts/enrich.ts`:** GitHub API + npm registry → `data/metrics.json`. Token só via env (`GITHUB_TOKEN`), nunca no cliente. Tolerante a falha (mantém último valor).
- Verificar as 64 URLs e corrigir descrições erradas.
**Verificação:** validate passa; enrich preenche métricas de ≥80% dos itens com repo; `tsc` e build ok.

## Etapa 2: Design system e shell
**Objetivo:** identidade bonita e profissional, sem "cara de vibecode".
- Antes de desenhar: abrir 3-4 referências do vault com Playwright e anotar padrões (densidade, tipografia, cards, cor). Skills: `impeccable` (shape/critique), `emil-design-eng`, `craft`, `frontend-design`; shadcn via MCP para primitivos acessíveis (Command, Dialog, Select, Checkbox, Badge, Sheet).
- **Tokens** (`app/globals.css`): neutros em vários tons (nada de #000/#fff), 1 acento + variações, escala tipográfica modular, espaçamento em grid de 4/8, raios e bordas consistentes. Tema **escuro e claro**.
- Tipografia: uma sans para UI + mono para metadados (nomes de pacote, versões). Títulos com line-height curto.
- **Shell:** Header (logo, busca, link Explorar, tema), Footer, container/grid, `ToolCard` (3 metadados + ícone/logo), `Badge`, `EmptyState`, `Skeleton`.
- Logos/ícones: avaliar `simple-icons` (já empacotado, sem rede) em vez de baixar imagens.
**Verificação:** screenshots desktop 1440 e mobile 390, claro e escuro; sem erros de console; checagem de contraste.

## Etapa 3: Catálogo, busca e filtros (coração do produto)
**Objetivo:** achar qualquer ferramenta em poucos segundos.
- **Rotas:** `/` (hero com busca, categorias, destaques, convite ao Explorar), `/tools` (catálogo completo), `/c/[categoria]`.
- **Busca:** fuzzy client-side (uma dependência pequena tipo Fuse/MiniSearch; 150 itens não precisam de servidor). Pesa nome > tags > descrição. Destaque do trecho encontrado.
- **Filtros por faceta com contagem:** categoria, tipo, preço, licença, plataforma, linguagem, tag. Combinação AND entre facetas, OR dentro da faceta. Filtros avançados recolhidos (Hick).
- **Ordenação:** relevância, mais populares (estrelas), mais recentes, A-Z.
- **Estado na URL** (`?q=&cat=&price=…`): link compartilhável e botão voltar funcionando.
- **Grade/lista** alternáveis; paginação ou "carregar mais" (sem scroll infinito que trava o rodapé).
- **`Cmd/Ctrl+K`** (paleta de comandos): pula direto para ferramenta/categoria.
- **Mobile:** filtros em `Sheet` inferior com contador de resultados no botão.
- Estados: vazio ("nenhum resultado" + sugerir limpar filtros), carregando, erro.
**Verificação:** Playwright: buscar "react", combinar 2 filtros, recarregar a página e confirmar que o estado persiste; teclado completo; mobile.

## Etapa 4: Página da ferramenta, comparar e "Minha stack"
- `/t/[slug]` estática (`generateStaticParams`): tagline, descrição, métricas (estrelas, versão, atualizado há…, downloads), links (site, repo, docs), **alternativas** e **relacionadas**, "quando usar / quando evitar".
- **Comparar** até 3 ferramentas lado a lado (tabela de atributos; diferenças destacadas).
- **Minha stack:** salvar ferramentas por área (editor, backend, banco…), barra de progresso (gradiente de meta), persistência em `localStorage` com try/catch; exportar como lista/Markdown.
- Botão compartilhar (copia URL).
**Verificação:** abrir 3 páginas de ferramentas, comparar 3, montar stack, recarregar e conferir persistência.

## Etapa 5: Modo Explorar 3D
- `/explore`: o 3D atual, agora **alimentado pelos mesmos filtros** (itens filtrados acendem, o resto apaga) e com o mesmo painel de detalhe do site.
- Home: prévia 3D leve atrás do hero com mouse tracking (inspirado em `site-cinematografico`), carregada de forma preguiçosa; não bloqueia o LCP.
- Performance: `instancedMesh`, `dpr` adaptativo, `frameloop="demand"` quando parado; **fallback 2D** em dispositivo fraco, sem WebGL ou `prefers-reduced-motion`.
- Corrigir pendências conhecidas: sobreposição de rótulos de clusters na visão geral; esferas planas (dar volume).
**Verificação:** medir FPS no desktop e em emulação de celular; fallback testado desligando WebGL.

## Etapa 6: Polimento, motion e acessibilidade
- Motion (único lib de animação de UI) para transições de lista/filtro, abrir painéis, hover/press; curvas e durações consistentes; nada de `transition: all`. Skills: `emil-design-eng`, `review-animations`, `accessible-animation`.
- Auditoria: `impeccable audit/polish`, `accessibility` (WCAG 2.1 AA): foco visível, ordem de tab, `aria-*` nos filtros, contraste, alvos ≥ 44px.
- Revisão responsiva e dos estados vazios/erro; microcopy (`design:ux-copy`).
**Verificação:** relatório do audit sem itens críticos; navegação 100% por teclado; reduced-motion respeitado.

## Etapa 7: Segurança, SEO e publicação
**Antes de publicar (checklist do vault, adaptada: site estático, sem login/banco):**
- Política de **privacidade e cookies** (obrigatória se houver analytics).
- XSS: nunca `dangerouslySetInnerHTML`; tratar como não confiável todo texto vindo de API externa (GitHub/npm).
- **Chaves:** `GITHUB_TOKEN` só em env de build/CI; checar que nada vaza no bundle (`grep` no `.next`).
- Nenhum arquivo sensível na raiz/`public/` (backup, zip, `.env`); revisar `.gitignore`.
- Cabeçalhos de segurança (CSP, X-Frame-Options, Referrer-Policy) no `next.config`.
- Rate limit/WAF: Vercel Firewall ou Cloudflare na frente; proteção contra bots.
- Pacotes: conferir que toda dependência existe e é a oficial (risco de "pacotes inventados"); `npm audit`.
- Itens do vault **não aplicáveis agora** (marcar N/A): 2FA de admin, SQL injection, banco aberto, prompt injection. Voltam se entrar Supabase/contas.
**SEO e leitura por IAs:** `<title>`/description únicos por página, OpenGraph, `sitemap.xml`, `robots.txt`, JSON-LD (`SoftwareApplication`), links internos (alternativas/relacionadas), `llms.txt`; HTML de cada página bem abaixo de 2 MB.
**Publicar:** Vercel (instalar CLI), domínio, rollback via git + Vercel.
**Depois de publicar:** Google Search Console, Bing Webmaster, analytics (preferir opção sem cookies), teste de velocidade (Lighthouse/PageSpeed). Perfil Google Meu Negócio e diretórios locais do vault **não se aplicam** a um catálogo global.
**Verificação:** Lighthouse ≥ 90 em performance/acessibilidade/SEO; scan de headers; URL pública abrindo; `npm audit` sem críticos.

## Etapa 8 (depois): Idiomas e crescimento
- `next-intl` com en como padrão e pt-BR (a estrutura de `messages/` da etapa 1 já prepara isso).
- Crescer o catálogo (meta ~300 itens), cron do enrich, formulário de sugestão (aí sim Supabase + checklist de segurança completa).

---

## Riscos e pontos de atenção
- **Escopo:** é grande. Por isso as etapas 0-3 já entregam um produto utilizável; 4-8 são camadas.
- **Qualidade dos dados** decide o valor do site mais que o visual. Etapa 1 é crítica.
- **GitHub API tem limite** sem token (60/h): o enrich precisa de token e cache.
- **3D em celular** pode ser pesado: por isso o fallback 2D na etapa 5.
- Next/Tailwind/shadcn mudam rápido: sempre consultar docs atuais (context7) em vez de memória.

## Verificação geral (toda etapa)
`npx tsc --noEmit` + `npm run build` sem erros; servidor em `localhost:3000`; Playwright MCP com screenshots em `./artifacts/` (desktop 1440 + mobile 390) descrevendo o que se vê; console sem erros; atualizar o checklist do `PLANO.md`.

---

## Decisões / Desvios (preencher ao fim de cada etapa)

### Etapa 0 (feita)
- Next.js **16.4.3** (Turbopack, Tailwind v4, React 19.3) sem `src/`: código em `app/`, `components/`, `lib/`. O Next gera `AGENTS.md` dizendo para ler `node_modules/next/dist/docs/` antes de codar: **vale seguir** (a versão tem mudanças de API).
- `create-next-app` rejeita o nome da pasta (tem espaço); o projeto foi gerado em pasta temporária e movido. `package.json` chama-se `biblioteca-dev`.
- Cache Components e Partial Prefetching vêm **ligados** no `next.config.ts` desta versão: considerar ao fazer páginas dinâmicas/`searchParams` (etapa 3).
- Protótipo 3D agora em `/explore`: `components/explore/{Scene,ExploreApp,ExploreLoader}.tsx` + `explore.css` (escopado em `.explore`). Dados em `lib/data.ts` (formato antigo; a etapa 1 troca pelo schema novo).
- Home (`/`) é só placeholder com link para `/explore`.
- StrictMode do React continua ligado (Next); os rótulos 3D usam projeção DOM, não `<Html>` do drei (esse quebra no React 19).
- Arquivos de template removidos. `artifacts/` e `.playwright-mcp/` estão no `.gitignore`.

### Etapa 1 (feita)
- **Dados:** `data/categories.json` (8 categorias, com cor) + `data/tools/<categoria>.json` (64 ferramentas, schema completo) + `data/metrics.json` (gerado). Carregados por `lib/catalog.ts` (imports estáticos com `with { type: 'json' }`; ao criar categoria nova, adicionar o import lá). `lib/data.ts` virou só um adaptador do catálogo para as posições 3D do `/explore` (lógica da cena intacta).
- **Schema (`lib/schema.ts`, zod 4):** valores de enum são chaves ASCII em inglês (`kind: library|framework|cli|service|app|language|runtime|database`, `pricing: free|open-source|freemium|paid`, `platforms: web|desktop|mobile|cli|cloud`); rótulos em `messages/pt-BR.ts`. **Desvio:** acrescentei `runtime` e `database` ao `kind` do plano (Node/Bun e PostgreSQL/Redis não cabiam em nenhum outro). `repo` é sempre `dono/nome` do GitHub; `subcategory` é texto livre por enquanto.
- **`tagline`** = frase curta (≤90 car.); **`description`** = 1-2 frases. `languages` = linguagens com que se usa a ferramenta (vazio se agnóstica). `featured` marcado em 10 itens.
- **Scripts** (Node 24 roda `.ts` direto, sem tsx; `package.json` ganhou `"type": "module"` e tsconfig `allowImportingTsExtensions`):
  - `npm run validate` (roda em `prebuild`): schema, slug único, categoria = arquivo, `alternatives` existem e não apontam para si, `metrics.json` coerente. Testado com dados quebrados de propósito.
  - `npm run enrich`: GitHub (estrelas, `pushed_at` como `lastCommit`, licença) + npm (versão, downloads/semana) → `metrics.json`. Mantém o valor anterior se a chamada falhar. Lê `GITHUB_TOKEN` do ambiente ou de `.env.local` (não existe ainda; rodei com `GITHUB_TOKEN=$(gh auth token)`). Avisa se a licença curada divergir da do GitHub. Resultado: **46/46 repositórios** com métricas; 42 com versão (git, django, postgresql, mongodb não têm release no GitHub nem pacote npm → `version: null`); 23 com downloads npm.
  - `npm run check-urls` (manual, usa rede): as **64 URLs respondem** (2xx/3xx). Corrigi `terraform.io` → `developer.hashicorp.com/terraform` (redirecionava) e `vitejs.dev` → `vite.dev`.
- **Descrições:** reescritas de memória e conferidas só por licença (cruzada com o GitHub) e pela URL estar viva; **não** foram comparadas com o texto oficial de cada site. Incertos: licença do **Warp** e do **Cursor** (marcados Proprietary), licença do **GraphQL** (uso a do `graphql-js`).
- **i18n:** `messages/pt-BR.ts` guarda todas as strings de UI (site, home, explore, rótulos dos enums); `ExploreApp`, home, layout e `/explore` já usam. Metadata também sai de lá.
- **Verificação:** `validate`, `tsc --noEmit` e `npm run build` ok; `/explore` igual ao da etapa 0 (64 de 64, 8 clusters), console sem erros; screenshots em `artifacts/etapa1-explore-{desktop,mobile}.png`. Sobreposição de rótulos (IA × Testes) e corte em mobile continuam, ficam para a etapa 5.

### Etapa 2 (feita)
- **Referências abertas:** só 2 das 4 pedidas (ui.unlumen.com e 21st.dev; screenshots em `artifacts/ref-*.png`). Padrões aproveitados: título display grande com tracking apertado e muito respiro, header mínimo com atalho de busca, borda hairline em vez de sombra, um acento só. Não abri refero/magicui.
- **Tokens (`app/globals.css`):** neutros quentes (claro `#f4f3ef`/`#fbfaf7`, escuro `#131312`/`#1a1a18`), 1 acento "brasa" (`#b93a16` claro, `#ee7a54` escuro) + `accent-soft`. Tailwind mapeia por `@theme inline` (`bg-surface`, `text-fg-muted`, `border-line`, `text-accent`…), então componentes **não usam `dark:`**. Escala tipográfica 12/14/16/20/28/40/72 com line-height que encolhe; foco visível global; `prefers-reduced-motion` neutraliza transições.
- **Tema:** `data-theme` em `<html>`, script inline em `app/layout.tsx` (aplica o salvo no `localStorage`, senão segue o sistema) e `ThemeToggle` sem estado (ícone escolhido por CSS). Testado: alterna, grava e persiste após recarregar.
- **Desvio de fontes:** além de Geist (UI) e Geist Mono (metadados), entrou **Instrument Serif só para títulos display** (home/h1/h2 de destaque). Foi escolha de design para dar voz ao site; remover é trocar `font-display`.
- **Rotas:** home movida para o grupo `app/(site)/` (com Header/Footer); `/explore` ficou **fora** do grupo porque é tela cheia. Nova `/design` (galeria de cores, tipografia, badge, card, skeleton, estado vazio; `noindex`): **remover/bloquear na etapa 7**. Strings soltas só nessa página interna (exceção consciente à regra de i18n).
- **Componentes:** `components/site/{Header,Footer,ThemeToggle,ToolCard}.tsx`, `components/ui/{Badge,Skeleton,EmptyState}.tsx`. Strings novas em `messages/pt-BR.ts`. `ToolCard`: monograma na cor da categoria + 3 metadados (tipo, preço, estrelas); link esticado sobre o card; prop `showFeatured` (a home esconde o selo, senão todo card seria "Destaque").
- **Logos:** **não usei `simple-icons`** (monograma em vez disso): exigiria mapear 64 slugs à mão e a lib removeu marcas (ex.: Microsoft). Reavaliar se o monograma incomodar.
- **Header sem busca e sem "Catálogo":** o plano previa busca no header, mas ela só faz sentido com o catálogo; entram na **etapa 3** (com `Cmd/Ctrl+K`). **Cards ainda apontam para o site oficial** (`target=_blank`); na etapa 4 passam a `/t/[slug]`.
- **shadcn:** não instalado nesta etapa (nada do shell precisa de Radix). Entra na etapa 3 (Command, Sheet, Select, Checkbox).
- **Home provisória:** hero + 9 destaques (o 10º some para fechar 3 linhas; aparece no catálogo). Home final (busca, categorias) é da etapa 3.
- **Contraste (calculado):** corpo/muted ≥ 6:1; `fg-subtle` ajustado para ≥ 4,5:1 inclusive sobre `surface-2`; botão e acento ≥ 5:1 nos dois temas. Alvos do header ≥ 44px.
- **Verificação:** `tsc --noEmit`, `eslint` e `npm run build` ok (4 rotas estáticas); sem erros de console em `/`, `/design` e `/explore`; sem scroll horizontal em 390px. Screenshots em `artifacts/etapa2-*.png`: home desktop claro/escuro, home mobile escuro, `/design` escuro, `/explore`. **Não tirei** mobile no tema claro nem `/design` no claro (os tokens são os mesmos, mas fica sem screenshot).

### Etapa 3 (feita)
- **Rotas:** `/tools` (catálogo), `/c/[categoria]` (static params; mesma UI com a categoria travada, breadcrumb e facetas sem "categoria") e home nova (busca em `<form>` GET para `/tools?q=`, grade das 8 áreas com contagem, 9 destaques, convite ao Explorar). `app/(site)/error.tsx` cobre o estado de erro (nesta versão do Next a prop é `retry`, não `reset`).
- **Lógica pura em `lib/search.ts`:** MiniSearch (única dependência nova) com pesos nome 5 > tags 3 > subcategoria 2 > tagline/descrição, prefixo, fuzzy só em termos > 3 letras, sem acento, AND entre termos. Facetas `cat, kind, price, lic, plat, lang, tag`: OR dentro da faceta, AND entre facetas; a contagem de cada opção ignora a própria faceta (assim dá para somar opções). Ordenação: relevância (sem busca = destaques e depois estrelas), populares, recentes, A–Z.
- **Estado na URL:** `?q=&cat=&kind=&price=&lic=&plat=&lang=&tag=&sort=&view=` (chaves repetidas; só grava o que difere do padrão). Lido com `useSearchParams` (dentro de `<Suspense>`) e gravado com `history.pushState/replaceState` nativos, que o Next integra: filtros usam push (voltar desfaz), digitação/ordenação/visualização usam replace.
- **UI:** `components/catalog/{Catalog,Facets,CatalogSkeleton}.tsx`. Principais visíveis (categoria, tipo, preço), avançadas em "Mais filtros" recolhido (plataforma, linguagem, licença, tag); chips dos filtros ativos; grade/lista; "carregar mais" de 24 em 24; destaque do trecho encontrado (`components/ui/Highlight.tsx`). Tags: só as com ≥ 2 ferramentas viram opção (das 67, quase todas são únicas).
- **Mobile:** filtros em gaveta inferior com botão "Ver N resultados". **Cmd/Ctrl+K:** `components/site/{SearchButton,CommandPalette}.tsx`, carregada sob demanda (dynamic import) na primeira abertura; setas/Enter/Esc; ferramenta abre o site oficial até a etapa 4 (`toolHref` em `lib/catalog.ts` troca para `/t/slug`).
- **Desvio: não instalei shadcn/Radix.** `<dialog>` nativo (`components/ui/Dialog.tsx`) dá foco preso, Esc e fundo inerte para a paleta e a gaveta; checkbox e select são nativos. Menos dependência, mesmo resultado; reavaliar se a etapa 6 pedir algo mais.
- **Limitação conhecida:** o HTML de `/tools` e `/c/*` traz só o esqueleto (a lista nasce no cliente, por causa de `useSearchParams`). Para SEO a etapa 7 deve renderizar a lista estática como fallback do Suspense ou ao menos nas páginas de categoria. `/design` ainda precisa ser removida/bloqueada na etapa 7.
- **Verificação:** `tsc`, `eslint`, `validate` e `build` ok (16 páginas). Playwright: busca "react" (5 resultados) + Framework + Open source = 3, recarregar mantém busca, filtros, chips e checkboxes; voltar desfaz o último filtro; Ctrl+K abre, filtra "postgre" e navega por setas; categoria em lista; estado vazio e "Limpar filtros" limpam também o campo; "carregar mais" 24→48→64; gaveta mobile; sem scroll horizontal em 390. Screenshots em `artifacts/etapa3-*.png`. Console limpo, exceto um aviso de hidratação por `caret-color` que o próprio Playwright injeta nos inputs (não vem do código). **Não testei** só-teclado completo no catálogo nem o tema claro no catálogo/mobile.

### Etapa 4 (feita)
- **Rotas:** `/t/[slug]` (64 páginas estáticas; o HTML já traz o conteúdo), `/compare?t=a&t=b&t=c` e `/stack`. `toolHref` agora aponta para `/t/slug`: cards, paleta Ctrl+K e home abrem a página interna (o link para o site oficial está nela). `ToolCard` e `CommandPalette` perderam o tratamento de link externo (código morto).
- **Página da ferramenta:** tagline, badges, botões (site, repositório, npm), descrição, "Quando usar / Quando evitar", alternativas e relacionadas (cards), coluna "Detalhes" (estrelas, versão, último commit, downloads, licença, plataformas, linguagens, subcategoria, tags). `relatedTo()` em `lib/catalog.ts`: mesma categoria, exclui alternativas, ordena por subcategoria + tags em comum (pode vir vazio, ex.: React).
- **Conteúdo novo: `data/guidance.json`** (`{slug: {use, avoid}}`, uma frase cada, as 64 ferramentas). **Desvio:** arquivo separado (como `metrics.json`) em vez de campos em cada `data/tools/*.json`, para não reformatar os 8 arquivos curados. `validate` exige uma entrada por ferramenta. **Escrito de memória, não verificado** contra a documentação oficial; vale revisar.
- **Desvios do plano:** sem link de "docs" (o schema não tem o campo); "atualizado há…" virou **data absoluta** (relativo ficaria velho no HTML estático); tags na página são só texto (a maioria tem 1 ferramenta, não vira filtro no catálogo).
- **Comparar:** estado na URL (compartilhável, voltar funciona; slugs inválidos/repetidos são ignorados; máx. 3). Seleção feita nos cards/página da ferramenta fica em `localStorage` (`lib/picks.ts`, `usePicks`, com fallback em memória se o storage falhar) e aparece na `CompareBar` fixa (`components/site/CompareBar.tsx`, só habilita "Comparar" com ≥ 2). Diferenças destacadas **só nos atributos categóricos** (categoria, tipo, preço, licença, plataformas, linguagens); estrelas, versão, datas, downloads e textos sempre diferem, então não entram no destaque nem no filtro "só as diferenças". Tabela rola na horizontal dentro do próprio quadro no mobile.
- **Minha stack:** `/stack` com 8 slots (um por categoria, aceitam várias ferramentas), barra "N de 8 áreas" (`role=progressbar`), link "Escolher em…" nos slots vazios, exportar em Markdown (bloco visível + botão copiar; só áreas preenchidas, com link do site oficial). Persistência em `localStorage`; valores salvos são filtrados contra o catálogo.
- **Compartilhar:** botão copia a URL (feedback em região `status`).
- **Header:** link "Stack" (rótulo curto para caber em 390px; a página se chama "Minha stack"), padding menor no mobile, busca com `min-w-11`.
- **Limitação conhecida:** slug inexistente (`/t/xyz`) mostra o 404 mas com status **200** (o `notFound()` roda dentro do Suspense, após o início do streaming). Só afeta URLs fora das 64; tratar na etapa 7 junto com SEO. O contador da stack/compare não aparece no header (só na `CompareBar` e na página).
- **Verificação:** `validate`, `tsc`, `eslint` e `build` ok (83 páginas). Playwright: marcar 3 ferramentas em páginas diferentes, 4ª fica desabilitada, recarregar mantém a seleção, "Comparar" abre `/compare?t=…` com 3 colunas, remover/adicionar/voltar mexem na URL, filtro de diferenças, URL com lixo, estado vazio; stack com 3 áreas, recarregar mantém, remover, Markdown copiado para o clipboard; sem scroll horizontal da página em 390. Screenshots em `artifacts/etapa4-*.png` (ferramenta, comparar, stack em desktop e mobile; ferramenta e comparar no claro). **Não testei** teclado completo nas novas telas, stack no claro e o estado do `localStorage` bloqueado.

### Etapa 5 (feita)
- **Mesmos filtros do catálogo:** `/explore` lê/grava a mesma URL (`?q=&cat=&price=…`) pelo hook novo `components/catalog/useFilterState.ts` (extraído do `Catalog`, que agora o usa também) e roda `runQuery`; quem casa **acende**, o resto apaga (escala menor + cor misturada ao fundo). Botão "Filtros" abre um `Dialog` com as mesmas `Facets` (`components/catalog/groups.ts` guarda `facetGroups/valueLabel`, compartilhados). Dentro do diálogo há o link "Ver N no catálogo" que leva os mesmos filtros para `/tools`. Enter na busca voa até o 1º resultado; Esc fecha diálogo → ferramenta → categoria.
- **Painel de detalhe do site:** `components/explore/ToolPanel.tsx` (categoria, nome, tagline, tipo/preço, estrelas/versão, "Ver página" → `/t/slug`, "Abrir site"). `lib/data.ts` agora expõe `clusters/nodes` com `slug` (some o formato antigo `Tool` com `desc/url/tags`); `matches()` foi removido (a busca é a do `lib/search.ts`).
- **Visual:** o wrapper do `/explore` usa `data-theme="dark"` e **os mesmos tokens do site** (Tailwind), então o HUD perdeu o CSS próprio (`explore.css` só tem a animação do painel). Para isso `globals.css` trocou `:root[data-theme="dark"]` por `[data-theme="dark"]` (um wrapper redeclara os tokens). Fundo da cena = `--bg` escuro (`#131312`), não mais o azulado `#0b0d12`. `/explore` é sempre escuro, mesmo com o site no claro.
- **Performance:** `Scene.tsx` reescrita com **`instancedMesh`** (64 esferas em 1 draw call; escala/cor animadas por instância), **`frameloop="demand"`** (só renderiza quando algo muda: `CameraControls regress`, `invalidate()` nos efeitos) e **`AdaptiveDpr`** (`dpr [1,2]`, cai durante interação). Stars sem animação (`speed={0}`).
- **Pendências antigas:** (1) sobreposição de rótulos: os rótulos de cluster do lado de trás da esfera somem (fade por `facing`), então na visão geral aparecem ~4 de 8; os outros ficam na barra inferior e aparecem ao girar. (2) esferas planas: tirei o emissivo total e usei material com luzes (ambiente + 2 direcionais); agora têm volume. (3) corte no celular: a distância da câmera na visão geral cresce em tela estreita até a esfera inteira caber (`overviewDist`); a névoa acompanha.
- **Fallback 2D (`components/explore/Fallback2D.tsx`):** grade das 8 áreas com as ferramentas como botões (apagadas = fora do filtro), mesmas seleções, painel e filtros. `lib/gl.ts` `detect3D()` decide: sem WebGL → 2D (sem opção de 3D); `prefers-reduced-motion` ou dispositivo fraco (≤ 2 núcleos, ≤ 2 GB, `saveData`) → 2D **com botão "Ativar 3D mesmo assim"**. Não há detecção em tempo de execução (se o FPS cair, não troca sozinho).
- **Home:** `components/home/HeroGalaxy.tsx` (nuvem das 64 esferas, gira devagar, segue o mouse, canvas transparente, máscara radial) atrás do hero, **só ≥ 768px**. Carregada por `HeroGalaxyLoader` depois do `load` + `requestIdleCallback`, então o chunk do three não entra no LCP. Pausa (`frameloop="never"`) fora da tela ou com a aba escondida. Em celular, sem WebGL, movimento reduzido ou dispositivo fraco o hero 2D fica como estava.
- **Carregamento:** `ExploreLoader` ganhou `loading` escuro ("Carregando…"); antes a tela ficava em branco claro até o chunk chegar.
- **Ambiente:** o dev server na porta 3000 estava servindo CSS velho (cache do Turbopack ignorou a edição do `globals.css`); parei o processo, apaguei `.next` e subi de novo com `npm run dev`. Se o CSS parecer defasado, é isso.
- **Verificação:** `tsc`, `eslint`, `validate` e `build` ok (83 páginas). Playwright: `/explore` desktop e mobile (390, esfera inteira cabe, sem scroll horizontal), voo até categoria, clique em esfera abre painel, `?q=react&price=open-source` acende 5 de 64 com rótulos só nos acesos, diálogo de filtros (marcar "Open source" → URL e contagem 40 de 64, link para o catálogo com o mesmo filtro), Esc em camadas, Enter na busca. **Sem WebGL** (bloqueando `getContext`): 0 canvas e 2D com aviso. **Movimento reduzido**: 2D e o botão ativa o 3D. Home: prévia aparece no desktop (screenshot) e **não** é montada em 390px. FPS (rAF, GPU real, não é celular de verdade): desktop 60 em repouso e durante o voo; viewport 390 com CPU 4× mais lenta: 60 em repouso, 59 no voo, pior quadro 67 ms. Screenshots em `artifacts/etapa5-*.png`.
- **Não testei:** só-teclado completo no Explorar (os rótulos de cluster 3D e as esferas não são alcançáveis por Tab; a barra de categorias, a busca, os filtros e o painel são), tema claro na home com a prévia 3D, aparelho físico, nem o 3D com `deviceMemory` baixo. O aviso do console `THREE.Clock deprecated` vem do R3F, não do código do projeto.
- **Para a etapa 6:** esferas e rótulos 3D sem equivalente por teclado (o Fallback 2D cobre, mas só se o usuário ativar); animações do painel/diálogo ainda em CSS (Motion ainda não instalado).

### Etapa 6 (feita)
- **Motion** (`motion` 14, único lib de UI): `components/MotionProvider.tsx` (LazyMotion `domAnimation` + `reducedMotion="user"`) no `app/layout.tsx`; curva/durações em `lib/motion.ts`. Cards do catálogo entram com fade+8px (só quem entra anima); `ToolPanel` do Explorar entra/sai com `AnimatePresence`. Sem animação de layout/saída na lista (desvio consciente: custo de `domMax`).
- **Dialog** (paleta, filtros): entrada/saída em CSS (`@starting-style` + `allow-discrete`, gaveta sobe de baixo); o conteúdo só desmonta após a saída. `explore.css` removido. **Press:** `scale .97` global em `button:active` e links `bg-accent`.
- **A11y:** axe (WCAG 2.2 AA + best-practice) em 8 rotas × claro/escuro × 1440/390: **0 violações**. Corrigidos: `h2` oculto nos resultados (heading-order), acento claro `#b93a16`→`#a63111` (contraste do chip), `<main>` no Explorar, skip link "Pular para o conteúdo" e "Pular filtros", alvos de toque ≥ 44px (logo, Grade/Lista, "Comparar" nos cards por área estendida, rótulos 3D, link voltar, nome na tabela). Explorar ganhou botão **"Ver em lista" / "Ver em 3D"** sempre visível (alternativa por teclado ao 3D).
- **Testado:** animação de dialog/painel/cards medida por opacidade ao longo do tempo; reduced-motion sem deslocamento; Tab/skip link; `localStorage` bloqueado sem erros.
- **Fechamento:** `tsc`, `eslint` e `npm run build` ok (83 páginas). Screenshots em `artifacts/etapa6-{home,tools,ferramenta}-{desktop,mobile}-{light,dark}.png` (12), console sem erros; no catálogo claro o chip/badge do acento tem contraste ok e os cards aparecem em grade de 3 colunas (desktop) e 1 (mobile). Microcopy de vazio/erro relida e mantida (curta, com ação clara); não rodei a skill `design:ux-copy`.
- **Não testei:** leitor de tela real (só axe e árvore de acessibilidade), Safari/Firefox para o `@starting-style` do dialog (sem suporte ele abre/fecha seco), `/explore` e `/stack` nos screenshots finais (cobertos só pelo axe e pelos testes de comportamento).
- **Para a etapa 7:** `/design` ainda precisa sair/ser bloqueada; lista estática de `/tools` e `/c/*` para SEO; status 404 real em `/t/xyz`.

### Etapa 7 (feita no código; **publicação pendente**)
- **Segurança:** cabeçalhos em `next.config.ts`: CSP (`default-src 'self'`, sem recurso externo, `frame-ancestors 'none'`, `object-src 'none'`), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS; `poweredByHeader: false`. **CSP sem nonce de propósito** (nonce forçaria render dinâmico e perderia o HTML estático): por isso `script-src` e `style-src` levam `'unsafe-inline'` (bootstrap do Next, script de tema, estilos do Motion). Testado em produção: `/explore` (3D) sem violação de CSP no console. `schema.ts`: `npm` agora tem regex (era string livre).
- **XSS:** único `dangerouslySetInnerHTML` além do script de tema é o `components/ui/JsonLd.tsx` (JSON-LD exige texto cru; `<` escapado). Todo texto do GitHub/npm entra como texto React. URLs curadas são `https` (zod) e `repo` tem regex.
- **Chaves/arquivos/pacotes:** token do `gh` não aparece em `.next` nem em `public/`; nenhum `.env`/zip/backup versionado ou na raiz; `public/` vazio. `npm audit`: **0 vulnerabilidades**. As 7 dependências diretas de runtime/build conferidas no registro (repositórios e mantenedores oficiais).
- **N/A (sem login/banco/formulário):** 2FA de admin, SQL injection, banco aberto, prompt injection, rotas de API (não há; só `robots`, `sitemap`, `llms.txt`).
- **`/design` removida** (não é mais rota nem noindex).
- **SEO:** `metadataBase` (`lib/site.ts`: env `SITE_URL`, senão `VERCEL_PROJECT_PRODUCTION_URL`, senão localhost), canonical em tool/categoria/catálogo/privacidade, OpenGraph+Twitter com imagem gerada (`app/opengraph-image.tsx`; páginas **não** devem declarar `openGraph` próprio, senão perdem a imagem), `robots.ts`, `sitemap.ts` (75 URLs; `lastModified` = `updatedAt` das métricas), `llms.txt` (route handler gerado do catálogo), JSON-LD `SoftwareApplication` em cada `/t/slug`. `/tools` e `/c/*` agora trazem no HTML 24 cards (fallback do Suspense renderizado no servidor, `CatalogSkeleton`), então há links rastreáveis sem JS.
- **Privacidade:** `/privacidade` (sem cookies, `localStorage` só local, sem analytics, Vercel como hospedagem) + link no rodapé. **Revisar o texto e acrescentar um contato** (controlador dos dados) antes de publicar; não pus e-mail por não ter um definido.
- **404:** `app/not-found.tsx` e `(site)/not-found.tsx` em pt-BR. `/t/xyz` e `/c/nada` **continuam com status 200** mas com `<meta name="robots" content="noindex">` e a tela 404: com Cache Components o shell estático é enviado antes de `params` resolver, então `notFound()` não consegue mudar o status (documentado em `streaming.md`). Um 404 real exigiria `proxy.ts` validando o slug; não fiz (noindex resolve para buscadores).
- **Lighthouse** (build de produção local, mobile simulado): `/` perf 94, `/t/react` 90, **`/tools` 89**; acessibilidade, boas práticas e SEO = **100** nas três. `/tools` fica 1 ponto abaixo da meta: LCP 3,3 s é o parágrafo de abertura com 2,9 s de "render delay" (TBT 200 ms, CLS 0); causa **não investigada**. Não consegui repetir a medição para ver a variância.
- **HTML:** maior página 127 KB (`/tools`), bem abaixo de 2 MB.
- **Verificação:** `tsc`, `eslint`, `validate`, `build` (87 páginas) ok; headers conferidos com `curl`; og/canonical/JSON-LD conferidos no navegador.
- **Pendente (precisa do usuário):** (1) **git:** as etapas 3–7 estão **sem commit** (só 0–2 foram commitadas); (2) instalar a Vercel CLI (`npm i -g vercel`), logar e publicar; (3) definir o domínio e `SITE_URL`; `GITHUB_TOKEN` só se for rodar o `enrich` no CI; (4) Firewall/rate limit da Vercel (ou Cloudflare) e proteção de bots: configuração no painel; (5) depois de no ar: Search Console, Bing Webmaster, analytics sem cookies (atualizar `/privacidade` antes), PageSpeed na URL pública, scan de headers, rollback via Vercel. Perfil Google Meu Negócio e diretórios locais: não se aplicam.

