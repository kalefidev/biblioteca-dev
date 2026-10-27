export type V3 = [number, number, number]
export type Tool = { name: string; desc: string; url: string; tags: string[]; cat: string; pos: V3 }
export type Category = { id: string; label: string; color: string; pos: V3; tools: Tool[] }

// [nome, descrição, url, tags]
type Raw = [string, string, string, string]

const RAW: Record<string, { label: string; color: string; tools: Raw[] }> = {
  editores: {
    label: 'Editores & IDEs',
    color: '#8fb4ff',
    tools: [
      ['VS Code', 'Editor leve e extensível da Microsoft, padrão de mercado.', 'https://code.visualstudio.com', 'editor,extensões'],
      ['Cursor', 'Fork do VS Code com IA integrada ao fluxo de edição.', 'https://cursor.com', 'editor,ia'],
      ['Neovim', 'Vim moderno, configurável em Lua, 100% teclado.', 'https://neovim.io', 'terminal,vim'],
      ['JetBrains IDEs', 'IntelliJ, WebStorm, PyCharm: refatoração e análise profundas.', 'https://www.jetbrains.com', 'ide,java,python'],
      ['Zed', 'Editor em Rust, muito rápido, com edição colaborativa.', 'https://zed.dev', 'editor,rust'],
      ['Sublime Text', 'Editor veloz, ótimo para arquivos enormes.', 'https://www.sublimetext.com', 'editor'],
      ['Helix', 'Editor modal pós-Vim com LSP e tree-sitter embutidos.', 'https://helix-editor.com', 'terminal,modal'],
      ['Xcode', 'IDE oficial da Apple para iOS e macOS.', 'https://developer.apple.com/xcode', 'ide,mobile'],
    ],
  },
  git: {
    label: 'Controle de versão',
    color: '#9ad9c0',
    tools: [
      ['Git', 'Sistema de versionamento distribuído, a base de tudo.', 'https://git-scm.com', 'vcs,cli'],
      ['GitHub', 'Hospedagem de repositórios, PRs, Actions e Copilot.', 'https://github.com', 'hospedagem,ci'],
      ['GitLab', 'Plataforma DevOps completa, pode ser self-hosted.', 'https://gitlab.com', 'hospedagem,ci'],
      ['Bitbucket', 'Repositórios com integração nativa ao Jira.', 'https://bitbucket.org', 'hospedagem'],
      ['lazygit', 'Interface de terminal para Git que poupa comandos.', 'https://github.com/jesseduffield/lazygit', 'tui,git'],
      ['GitHub CLI', 'Crie PRs e issues direto do terminal com `gh`.', 'https://cli.github.com', 'cli,github'],
      ['Gitea', 'Forge Git leve e auto-hospedável.', 'https://about.gitea.com', 'self-hosted'],
      ['pre-commit', 'Hooks de Git para várias linguagens, gerenciados por config.', 'https://pre-commit.com', 'hooks,qualidade'],
    ],
  },
  frontend: {
    label: 'Frontend',
    color: '#f2b880',
    tools: [
      ['React', 'Biblioteca de UI baseada em componentes.', 'https://react.dev', 'ui,js'],
      ['Next.js', 'Framework React com SSR, rotas e edge.', 'https://nextjs.org', 'framework,react'],
      ['Vite', 'Bundler e dev server instantâneo.', 'https://vitejs.dev', 'build,dev'],
      ['Tailwind CSS', 'CSS utilitário com design tokens.', 'https://tailwindcss.com', 'css'],
      ['Svelte', 'Compilador de UI sem virtual DOM.', 'https://svelte.dev', 'ui,framework'],
      ['Astro', 'Sites de conteúdo com zero JS por padrão.', 'https://astro.build', 'ssg,conteúdo'],
      ['shadcn/ui', 'Componentes copiáveis sobre Radix e Tailwind.', 'https://ui.shadcn.com', 'componentes'],
      ['Three.js', 'Biblioteca de 3D para a web (WebGL/WebGPU).', 'https://threejs.org', '3d,webgl'],
    ],
  },
  backend: {
    label: 'Backend & APIs',
    color: '#c9a7f0',
    tools: [
      ['Node.js', 'Runtime JavaScript no servidor.', 'https://nodejs.org', 'runtime,js'],
      ['Bun', 'Runtime, bundler e gerenciador de pacotes tudo-em-um.', 'https://bun.sh', 'runtime,js'],
      ['FastAPI', 'APIs Python rápidas, tipadas e com docs automáticas.', 'https://fastapi.tiangolo.com', 'python,api'],
      ['Django', 'Framework Python completo, com ORM e admin.', 'https://www.djangoproject.com', 'python,framework'],
      ['Express', 'Framework HTTP minimalista para Node.', 'https://expressjs.com', 'node,http'],
      ['Hono', 'Framework web ultraleve para edge e Node.', 'https://hono.dev', 'edge,ts'],
      ['tRPC', 'APIs com tipos de ponta a ponta, sem schema.', 'https://trpc.io', 'typescript,api'],
      ['GraphQL', 'Linguagem de consulta para APIs flexíveis.', 'https://graphql.org', 'api,query'],
    ],
  },
  dados: {
    label: 'Bancos de dados',
    color: '#e99aa6',
    tools: [
      ['PostgreSQL', 'Banco relacional robusto e extensível.', 'https://www.postgresql.org', 'sql'],
      ['Supabase', 'Postgres + auth + storage + realtime.', 'https://supabase.com', 'baas,postgres'],
      ['SQLite', 'Banco embutido em um único arquivo.', 'https://sqlite.org', 'sql,embutido'],
      ['Redis', 'Cache e estruturas de dados em memória.', 'https://redis.io', 'cache,kv'],
      ['MongoDB', 'Banco de documentos JSON.', 'https://www.mongodb.com', 'nosql'],
      ['Prisma', 'ORM TypeScript com schema declarativo.', 'https://www.prisma.io', 'orm,ts'],
      ['Drizzle ORM', 'ORM TypeScript leve, próximo do SQL.', 'https://orm.drizzle.team', 'orm,ts'],
      ['DBeaver', 'Cliente universal de bancos de dados.', 'https://dbeaver.io', 'gui,sql'],
    ],
  },
  devops: {
    label: 'DevOps & Cloud',
    color: '#8ed0e6',
    tools: [
      ['Docker', 'Containers para empacotar e rodar qualquer app.', 'https://www.docker.com', 'container'],
      ['Kubernetes', 'Orquestração de containers em escala.', 'https://kubernetes.io', 'orquestração'],
      ['Vercel', 'Deploy de frontends e funções com previews.', 'https://vercel.com', 'hospedagem'],
      ['Cloudflare', 'CDN, Workers, DNS e segurança de borda.', 'https://www.cloudflare.com', 'edge,cdn'],
      ['Terraform', 'Infraestrutura como código multi-cloud.', 'https://www.terraform.io', 'iac'],
      ['GitHub Actions', 'CI/CD dentro do repositório.', 'https://github.com/features/actions', 'ci,cd'],
      ['AWS', 'Maior catálogo de serviços de nuvem.', 'https://aws.amazon.com', 'cloud'],
      ['Grafana', 'Dashboards e observabilidade de métricas.', 'https://grafana.com', 'monitoramento'],
    ],
  },
  testes: {
    label: 'Testes & Qualidade',
    color: '#d6d27a',
    tools: [
      ['Vitest', 'Test runner nativo do Vite, compatível com Jest.', 'https://vitest.dev', 'unit,ts'],
      ['Jest', 'Framework de testes JavaScript consagrado.', 'https://jestjs.io', 'unit,js'],
      ['Playwright', 'Testes end-to-end em vários navegadores.', 'https://playwright.dev', 'e2e'],
      ['Cypress', 'E2E com UI de depuração interativa.', 'https://www.cypress.io', 'e2e'],
      ['ESLint', 'Linter de JavaScript e TypeScript.', 'https://eslint.org', 'lint'],
      ['Prettier', 'Formatador de código opinativo.', 'https://prettier.io', 'formatação'],
      ['Biome', 'Linter e formatador em Rust, bem rápido.', 'https://biomejs.dev', 'lint,rust'],
      ['SonarQube', 'Análise estática de qualidade e segurança.', 'https://www.sonarsource.com', 'qualidade'],
    ],
  },
  ia: {
    label: 'IA & Produtividade',
    color: '#b5b9c7',
    tools: [
      ['Claude Code', 'Agente de código no terminal e na IDE.', 'https://claude.com/claude-code', 'agente,cli'],
      ['GitHub Copilot', 'Autocompletar e chat de código no editor.', 'https://github.com/features/copilot', 'ia,editor'],
      ['Postman', 'Testar, documentar e automatizar APIs.', 'https://www.postman.com', 'api,teste'],
      ['Insomnia', 'Cliente de API open source e enxuto.', 'https://insomnia.rest', 'api'],
      ['Raycast', 'Launcher com comandos, snippets e extensões.', 'https://www.raycast.com', 'macos,produtividade'],
      ['Warp', 'Terminal moderno com blocos e IA.', 'https://www.warp.dev', 'terminal'],
      ['Figma', 'Design colaborativo e handoff para devs.', 'https://www.figma.com', 'design'],
      ['Obsidian', 'Notas em Markdown com links entre ideias.', 'https://obsidian.md', 'notas'],
    ],
  },
}

// Distribui i de n pontos numa esfera de raio r (espiral de Fibonacci).
const fib = (i: number, n: number, r: number): V3 => {
  const y = 1 - (2 * (i + 0.5)) / n
  const rad = Math.sqrt(1 - y * y)
  const a = i * 2.399963
  return [Math.cos(a) * rad * r, y * r, Math.sin(a) * rad * r]
}

const ids = Object.keys(RAW)
export const CLUSTER_R = 3
export const categories: Category[] = ids.map((id, i) => {
  const { label, color, tools } = RAW[id]
  const pos = fib(i, ids.length, 16)
  return {
    id, label, color, pos,
    tools: tools.map(([name, desc, url, tags], j) => {
      const o = fib(j, tools.length, CLUSTER_R)
      return { name, desc, url, tags: tags.split(','), cat: id, pos: [pos[0] + o[0], pos[1] + o[1], pos[2] + o[2]] as V3 }
    }),
  }
})
export const allTools = categories.flatMap((c) => c.tools)
export const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

export const matches = (t: Tool, q: string) =>
  !q || `${t.name} ${t.desc} ${t.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())
