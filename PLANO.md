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
- [ ] 1. Dados (schema, validação, enriquecimento por API)
- [ ] 2. Design system e shell do site
- [ ] 3. Catálogo: busca, filtros e páginas de categoria
- [ ] 4. Página da ferramenta, comparar e "Minha stack"
- [ ] 5. Modo Explorar 3D
- [ ] 6. Polimento, motion e acessibilidade
- [ ] 7. Segurança, SEO e publicação
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
