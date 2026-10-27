// Todas as strings de UI ficam aqui (base para i18n na etapa 8). Conteúdo do catálogo fica em data/.
export const pt = {
  site: {
    name: 'Biblioteca de ferramentas',
    description: 'Catálogo de ferramentas, bibliotecas e serviços para desenvolvedores.',
  },
  nav: {
    home: 'Início',
    explore: 'Explorar',
    main: 'Navegação principal',
  },
  theme: {
    toggle: 'Alternar tema',
    light: 'Tema claro',
    dark: 'Tema escuro',
  },
  footer: {
    tagline: 'Curadoria de ferramentas para quem constrói software.',
    data: 'Métricas via GitHub e npm.',
  },
  card: {
    featured: 'Destaque',
    stars: 'estrelas no GitHub',
    openSite: 'Abrir site em nova aba',
  },
  states: {
    emptyTitle: 'Nenhuma ferramenta encontrada',
    emptyHint: 'Tente outro termo ou limpe os filtros.',
    emptyAction: 'Limpar filtros',
    loading: 'Carregando',
  },
  home: {
    eyebrow: 'Catálogo para devs',
    title: 'A ferramenta certa para cada parte da sua stack.',
    lead: (tools: number, areas: number) => `${tools} ferramentas em ${areas} áreas, curadas à mão e com métricas reais de GitHub e npm.`,
    openExplore: 'Abrir o modo Explorar',
    featuredTitle: 'Em destaque',
    featuredHint: 'As escolhas mais sólidas para começar.',
    exploreTitle: 'Veja o catálogo como um mapa',
    exploreLead: 'O modo Explorar espalha as ferramentas em 3D, agrupadas por área. Arraste, aproxime e clique.',
  },
  explore: {
    title: 'Explorar',
    count: (hits: number, total: number) => `${hits} de ${total} ferramentas · arraste para girar, role para aproximar`,
    searchPlaceholder: 'Buscar ferramenta, tag ou uso…',
    searchLabel: 'Buscar ferramentas',
    categoriesLabel: 'Categorias',
    overview: 'Visão geral',
    close: 'Fechar',
    openSite: 'Abrir site ↗',
  },
  // Rótulos dos valores de enum do schema (lib/schema.ts).
  kind: {
    library: 'Biblioteca', framework: 'Framework', cli: 'CLI', service: 'Serviço',
    app: 'App', language: 'Linguagem', runtime: 'Runtime', database: 'Banco de dados',
  },
  pricing: { free: 'Grátis', 'open-source': 'Open source', freemium: 'Freemium', paid: 'Pago' },
  platform: { web: 'Web', desktop: 'Desktop', mobile: 'Mobile', cli: 'CLI', cloud: 'Nuvem' },
} as const
