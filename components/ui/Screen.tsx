import { HTMLAttributes, ReactNode } from 'react';

export function Screen({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={`min-h-screen surface-page p-6 ${className}`} {...rest}>
      <div className="max-w-md mx-auto">{children}</div>
    </main>
  );
}

interface ScreenHeaderProps {
  left: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ left, title, subtitle, right }: ScreenHeaderProps) {
  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center mb-8 gap-2">
      <div className="justify-self-start min-w-0">{left}</div>
      <div className="text-center min-w-0">
        {title && <h2 className="font-black text-page-fg">{title}</h2>}
        {subtitle && (
          <p className="text-[10px] text-card-muted-fg uppercase font-bold tracking-widest">{subtitle}</p>
        )}
      </div>
      <div className="justify-self-end flex items-center gap-2 flex-wrap">{right}</div>
    </header>
  );
}
