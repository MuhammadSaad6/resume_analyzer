import type { ReactNode } from 'react';

export const CARD_TITLE_CLASS_NAME =
  'all-cards-title bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-200 bg-clip-text text-transparent font-bold';

export const CARD_FRAME_CLASS_NAME = 'all-cards-frame';

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`${CARD_TITLE_CLASS_NAME} ${className}`.trim()}>{children}</p>;
}
