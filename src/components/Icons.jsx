export const LoopMark = ({ color = '#A6D854', size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M6 34 C 14 30 20 24 22 16 C 23 10 20 6 17 8 C 14 10 17 20 24 24 C 30 27 35 22 34 15" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const PhoneIcon = ({ size = 26, color = 'currentColor', strokeWidth = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const CheckIcon = ({ size = 28, color = '#3F6B12' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const DashIcon = ({ size = 28, color = '#FFC58A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

export const MicIcon = ({ size = 24, off = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

export const HangUpIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 14.5c4.7-4.2 12.3-4.2 17 0l-1.8 2.6a1.5 1.5 0 0 1-1.9.4l-2.2-1.1a1.5 1.5 0 0 1-.8-1.4v-1.3a11 11 0 0 0-3.6 0V15a1.5 1.5 0 0 1-.8 1.4l-2.2 1.1a1.5 1.5 0 0 1-1.9-.4z" />
  </svg>
);

export const IdCardIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M15 10h3M15 13h3" />
  </svg>
);

export const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
