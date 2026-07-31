import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export default function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[10px] uppercase font-black text-card-muted-fg tracking-wider mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldInputClassName(invalid = false): string {
  return `w-full surface-input py-4 px-6 rounded-2xl outline-none font-bold focus-visible:ring-2 focus-visible:ring-focus-ring transition-all ${
    invalid ? 'ring-2 ring-danger' : ''
  }`;
}
