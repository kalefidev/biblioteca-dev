'use client'

import { useEffect, useState } from 'react'
import Scene, { type Sel } from './Scene'
import { allTools, categories, catById, matches, type Tool } from '@/lib/data'
import './explore.css'

export default function ExploreApp() {
  const [sel, setSel] = useState<Sel>({ cat: null, tool: null })
  const [query, setQuery] = useState('')

  const home = () => setSel({ cat: null, tool: null })
  const pickCat = (id: string) => setSel({ cat: id, tool: null })
  const pickTool = (t: Tool) => setSel({ cat: t.cat, tool: t })
  const back = () => (sel.tool ? pickCat(sel.cat!) : home())

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && back()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const hits = query ? allTools.filter((t) => matches(t, query)).length : allTools.length
  const cat = sel.cat ? catById[sel.cat] : null
  const t = sel.tool

  return (
    <div className="explore">
      <Scene sel={sel} query={query} onTool={pickTool} onCat={pickCat} />

      <header className="hud top">
        <h1>Biblioteca de ferramentas</h1>
        <p>{hits} de {allTools.length} ferramentas · arraste para girar, role para aproximar</p>
        <input
          type="search"
          value={query}
          placeholder="Buscar ferramenta, tag ou uso…"
          aria-label="Buscar ferramentas"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            const first = allTools.find((x) => matches(x, query))
            if (first) pickTool(first)
          }}
        />
      </header>

      <nav className="hud bottom" aria-label="Categorias">
        <button className={!sel.cat ? 'chip on' : 'chip'} onClick={home}>Visão geral</button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={sel.cat === c.id ? 'chip on' : 'chip'}
            style={{ ['--c' as string]: c.color }}
            onClick={() => pickCat(c.id)}
          >
            <i /> {c.label}
          </button>
        ))}
      </nav>

      {t && cat && (
        <aside className="hud panel" style={{ ['--c' as string]: cat.color }} key={t.name}>
          <button className="x" onClick={back} aria-label="Fechar">×</button>
          <span className="kicker">{cat.label}</span>
          <h2>{t.name}</h2>
          <p>{t.desc}</p>
          <ul>{t.tags.map((g) => <li key={g}>{g}</li>)}</ul>
          <a href={t.url} target="_blank" rel="noreferrer">Abrir site ↗</a>
        </aside>
      )}
    </div>
  )
}
