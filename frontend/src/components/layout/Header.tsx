import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@heroui/react'
import { useThemeStore } from '../../stores/theme.store'
import { SHORTCUT_LABEL } from '../QuickActions'

interface Props {
  onMenuClick?: () => void
  onQuickAction?: () => void
}

export default function Header({ onMenuClick, onQuickAction }: Props) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4 gap-3">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        isIconOnly
        size="sm"
        onClick={onMenuClick}
        aria-label="Otvori izbornik"
        className="lg:hidden"
      >
        <Menu size={20} />
      </Button>

      {/* Quick actions trigger */}
      <button
        onClick={onQuickAction}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-default hover:bg-default-hover text-muted text-sm transition-colors flex-1 max-w-xs"
        aria-label="Brze akcije"
      >
        <span className="flex-1 text-left">Pretraži...</span>
        <kbd className="text-xs bg-surface border border-border rounded px-1.5 py-0.5 font-mono text-muted whitespace-nowrap">
          {SHORTCUT_LABEL}
        </kbd>
      </button>

      <div className="flex-1 sm:hidden" />

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        isIconOnly
        size="sm"
        onClick={toggleTheme}
        aria-label="Promijeni temu"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  )
}
