import Image from 'next/image'
import type { StaffRole } from '@/lib/staff-accounts'

// Round avatar: the man silhouette for managers, the standard user icon for staff.
// user.png is already a black circle; profile.png is a bare silhouette, so it's drawn
// inside a circle and cropped at the bottom to match. `onDark` flips to a white circle
// (used on the black header bar).
export default function RoleAvatar({
  role,
  onDark = false,
  className = '',
}: Readonly<{ role: StaffRole; onDark?: boolean; className?: string }>) {
  if (role === 'manager') {
    return (
      <span
        aria-hidden
        className={`flex items-end justify-center overflow-hidden rounded-full ${onDark ? 'bg-white' : 'bg-black-900'} ${className}`}
      >
        <Image
          src="/Icons/profile.png"
          alt=""
          width={512}
          height={512}
          className={`h-[82%] w-[82%] translate-y-[6%] brightness-0 ${onDark ? '' : 'invert'}`}
        />
      </span>
    )
  }

  return (
    <Image
      src="/Icons/user.png"
      alt=""
      aria-hidden
      width={512}
      height={512}
      className={`rounded-full ${onDark ? 'invert' : ''} ${className}`}
    />
  )
}
