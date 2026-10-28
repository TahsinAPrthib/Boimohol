// The phone layout's icons: one 24px grid, round line ends and a single
// stroke weight, like SearchIcon. An active tab draws heavier and fills its
// shape lightly, so the difference doesn't rest on colour alone.

type IconProps = { className?: string; active?: boolean };

function Icon({ className = "h-6 w-6", active = false, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const fill = (active?: boolean) => (active ? { fill: "currentColor", fillOpacity: 0.16 } : {});

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.4 12 4l8 6.4V19a1 1 0 0 1-1 1h-4.6v-5.6H9.6V20H5a1 1 0 0 1-1-1z" {...fill(props.active)} />
    </Icon>
  );
}

export function SearchTabIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" {...fill(props.active)} />
      <path d="m15.6 15.6 4.4 4.4" />
    </Icon>
  );
}

// Three spines on a shelf, the last one leaning.
export function LibraryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4.5h3.2v15H5zM9.7 4.5h3.2v15H9.7z" {...fill(props.active)} />
      <path d="m14.4 5.6 3.1-.8 3.3 13.9-3.1.8z" {...fill(props.active)} />
      <path d="M3.5 19.5h17" />
    </Icon>
  );
}

// Two arrows passing each other: a book changing hands.
export function ExchangeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 8.5h14M15 5l3.5 3.5L15 12M19.5 15.5h-14M9 12l-3.5 3.5L9 19" />
    </Icon>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.4" r="3.6" {...fill(props.active)} />
      <path d="M4.8 20c1.1-3.6 3.8-5.6 7.2-5.6s6.1 2 7.2 5.6" {...fill(props.active)} />
    </Icon>
  );
}

export function MessagesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4.8h14a1 1 0 0 1 1 1v9.4a1 1 0 0 1-1 1h-7.6L6.5 20v-3.8H5a1 1 0 0 1-1-1V5.8a1 1 0 0 1 1-1z" {...fill(props.active)} />
    </Icon>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 5 7.5 12l7 7" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 5 7 7-7 7" />
    </Icon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19.5s-7.5-4.4-7.5-9.6A4 4 0 0 1 12 7.6a4 4 0 0 1 7.5 2.3c0 5.2-7.5 9.6-7.5 9.6z" />
    </Icon>
  );
}

// A note asking for a book: a page with a question mark.
export function RequestIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3.5h8l3.5 3.5v13a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-16a.5.5 0 0 1 .5-.5z" />
      <path d="M10 10.2a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.3v.4M12 16.6v.1" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8M10.5 12H20M16.5 8.5 20 12l-3.5 3.5" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6v5.6c0 4.3-3 7.4-7 8.9-4-1.5-7-4.6-7-8.9V6z" />
    </Icon>
  );
}
