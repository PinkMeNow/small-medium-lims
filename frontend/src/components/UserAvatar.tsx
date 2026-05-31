import type { AuthUser } from '../types/auth'

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function avatarStyle(id: string): React.CSSProperties {
  const h = hashId(id)
  const hue1 = h % 360
  const hue2 = (hue1 + 65 + (h >> 8) % 50) % 360
  const sat1 = 55 + (h % 20)
  const sat2 = 50 + ((h >> 4) % 25)
  // Subtle diagonal pattern overlay via SVG data URI
  const stripe = `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 8L8 0M-1 1L1-1M7 9L9 7' stroke='rgba(255,255,255,0.12)' stroke-width='1.5'/%3E%3C/svg%3E")`
  return {
    background: `${stripe}, linear-gradient(135deg, hsl(${hue1}, ${sat1}%, 40%) 0%, hsl(${hue2}, ${sat2}%, 52%) 100%)`,
  }
}

interface Props {
  user: Pick<AuthUser, 'id' | 'firstName' | 'lastName'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = { sm: 32, md: 40, lg: 48 }
const FONT = { sm: 12, md: 14, lg: 16 }

export default function UserAvatar({ user, size = 'sm', className = '' }: Props) {
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  const dim = SIZE[size]
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
      style={{
        ...avatarStyle(user.id),
        width: dim,
        height: dim,
        fontSize: FONT[size],
        letterSpacing: '0.03em',
      }}
      title={`${user.firstName} ${user.lastName}`}
    >
      {initials}
    </div>
  )
}
