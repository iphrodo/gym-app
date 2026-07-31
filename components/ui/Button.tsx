import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'surface-card-inverted shadow-xl hover:opacity-90',
  secondary: 'surface-muted hover:opacity-80',
  destructive: 'bg-danger text-danger-fg hover:opacity-90',
};

export default function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`py-5 rounded-[2rem] font-black text-xl transition-all active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${variantClassName[variant]} ${className}`}
      {...rest}
    />
  );
}
