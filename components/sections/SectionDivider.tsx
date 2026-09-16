type SectionDividerProps = {
  readonly bottomColor?: string
}

export default function SectionDivider({
  bottomColor = 'white',
}: SectionDividerProps) {
  return (
    <div className="relative h-[86px] w-full overflow-hidden" aria-hidden="true">
      <svg
        className="absolute bottom-0 left-0 h-full w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,54 C90,34 210,34 330,54 C450,74 570,74 690,54 C810,34 930,34 1050,54 C1170,74 1290,74 1410,54 C1420,53 1430,52 1440,52 L1440,120 L0,120 Z"
          fill="white"
        />
        <path
          d="M0,46 C120,18 240,18 360,46 C480,74 600,74 720,46 C840,18 960,18 1080,46 C1200,74 1320,74 1440,46 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  )
}
