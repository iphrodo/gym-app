import { ReactNode } from 'react';

export default function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 surface-card text-card-muted-fg rounded-[2.5rem] border text-center font-medium shadow-sm">
      {children}
    </div>
  );
}
