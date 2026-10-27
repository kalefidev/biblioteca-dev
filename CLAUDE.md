# Biblioteca de ferramentas dev

Catálogo profissional de ferramentas/bibliotecas para devs (2D principal + modo 3D "Explorar").

**Antes de qualquer coisa: leia `PLANO.md`.** Ele tem o checklist de etapas, as decisões e o que já foi feito. Execute **uma etapa por sessão**, atualize o checklist e a seção "Decisões / Desvios" ao terminar, rode a verificação e avise o usuário para dar `/clear`.

## Regras do projeto
- Next.js 16 (App Router). Leia `node_modules/next/dist/docs/` antes de usar APIs do Next; não confie na memória.
- Dev server na porta **3000**. Depois de mudança visual: Playwright MCP, screenshot em `./artifacts/` (desktop 1440 + mobile 390), descrever o que se vê.
- Design: regras do vault (`Obsidian Vault/design/regras-visuais`): sem #000/#fff puros, muito espaço, escala tipográfica, 1 acento + variações, grid, títulos com line-height curto.
- Um único lib de animação de UI (Motion). Three/R3F só no 3D. Sem GSAP.
- Nenhuma string de UI solta em componente a partir da etapa 1 (i18n depois).
- Segredos só em `.env.local` (ignorado pelo git); nunca no cliente.
- `rm` com caminhos explícitos (globs são bloqueados pelo Claude Code).
