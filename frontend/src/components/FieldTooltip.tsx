import { Info } from 'lucide-react'
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@heroui/react'

interface Props {
  text: string
}

export default function FieldTooltip({ text }: Props) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          className="text-muted hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Informacija o polju"
        >
          <Info size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs text-xs"
        style={{ wordBreak: 'normal', overflowWrap: 'normal', hyphens: 'none' }}
      >
        {text}
      </TooltipContent>
    </TooltipRoot>
  )
}
