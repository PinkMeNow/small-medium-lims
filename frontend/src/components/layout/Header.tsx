import { Moon, Sun } from 'lucide-react'
import { Button } from '@heroui/react'
import { useThemeStore } from '../../stores/theme.store'

export default function Header() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center justify-end px-4">
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
