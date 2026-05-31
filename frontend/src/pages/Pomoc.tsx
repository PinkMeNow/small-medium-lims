import { useState, useMemo } from 'react'
import { SearchField, SearchFieldGroup, SearchFieldSearchIcon, SearchFieldInput, SearchFieldClearButton } from '@heroui/react'
import { HELP_CATEGORIES, HELP_ARTICLES } from '../features/help/helpContent'

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-accent-soft text-accent rounded px-0.5">{part}</mark>
      : part
  )
}

export default function Pomoc() {
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>('uvod-sto-je-lims')

  const filtered = useMemo(() => {
    if (!search.trim()) return HELP_ARTICLES
    const q = search.toLowerCase()
    return HELP_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.keywords.some(k => k.includes(q))
    )
  }, [search])

  const activeArticle = HELP_ARTICLES.find(a => a.id === activeId) ?? null

  const grouped = useMemo(() =>
    HELP_CATEGORIES.map(cat => ({
      ...cat,
      articles: filtered.filter(a => a.categoryId === cat.id),
    })).filter(cat => cat.articles.length > 0),
    [filtered]
  )

  // When searching, show first matching article
  const displayArticle = search.trim()
    ? (filtered.find(a => a.id === activeId) ?? filtered[0] ?? null)
    : activeArticle

  return (
    <div className="flex flex-col gap-4 md:gap-0">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Pomoć</h1>
        <p className="text-sm text-muted mt-1">Upute za korištenje LIMS sustava</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchField value={search} onChange={setSearch} className="max-w-md">
          <SearchFieldGroup>
            <SearchFieldSearchIcon />
            <SearchFieldInput placeholder="Pretraži pomoć..." />
            <SearchFieldClearButton />
          </SearchFieldGroup>
        </SearchField>
      </div>

      <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
        {/* Left nav */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {grouped.length === 0 && (
              <p className="text-sm text-muted px-3 py-2">Nema rezultata za "{search}"</p>
            )}
            {grouped.map(cat => (
              <div key={cat.id} className="mb-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-1">
                  {cat.icon} {cat.title}
                </p>
                {cat.articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => { setActiveId(article.id); setSearch(s => s) }}
                    className={[
                      'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                      (search.trim() ? displayArticle?.id : activeId) === article.id
                        ? 'bg-accent-soft text-accent font-medium'
                        : 'text-muted hover:bg-default hover:text-foreground',
                    ].join(' ')}
                  >
                    {search ? highlight(article.title, search) : article.title}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Article content */}
        <div className="flex-1 min-w-0">
          {displayArticle ? (
            <div className="bg-surface rounded-xl border border-border p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {search ? highlight(displayArticle.title, search) : displayArticle.title}
              </h2>
              <p className="text-xs text-muted mb-6">
                {HELP_CATEGORIES.find(c => c.id === displayArticle.categoryId)?.title}
              </p>
              <div className="prose-sm text-foreground leading-relaxed">
                {displayArticle.content.split('\n\n').map((block, i) => {
                  const highlighted = search ? highlight(block, search) : block
                  if (block.startsWith('•')) {
                    const items = block.split('\n').filter(l => l.startsWith('•'))
                    return (
                      <ul key={i} className="list-none space-y-1 mb-4">
                        {items.map((item, j) => (
                          <li key={j} className="flex gap-2 text-sm text-muted">
                            <span className="text-accent shrink-0">•</span>
                            <span>{search ? highlight(item.slice(1).trim(), search) : item.slice(1).trim()}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  if (block.includes('\n') && !block.startsWith(' ')) {
                    const lines = block.split('\n')
                    const heading = lines[0]
                    const rest = lines.slice(1).join('\n')
                    return (
                      <div key={i} className="mb-4">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {search ? highlight(heading, search) : heading}
                        </p>
                        <p className="text-sm text-muted whitespace-pre-line">
                          {search ? highlight(rest, search) : rest}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <p key={i} className="text-sm text-muted mb-4 whitespace-pre-line">
                      {highlighted}
                    </p>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-8 text-center">
              <p className="text-muted text-sm">Odaberite temu iz navigacije s lijeve strane.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
