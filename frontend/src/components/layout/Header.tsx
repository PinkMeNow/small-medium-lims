import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@heroui/react'
import { useThemeStore } from '../../stores/theme.store'

interface Props {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: Props) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4">
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

      <div className="flex-1" />

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
