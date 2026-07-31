import { ElementType, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'inverted';
  interactive?: boolean;
  rounded?: 'lg' | 'md';
  as?: ElementType;
}

const variantClassName: Record<'default' | 'inverted', string> = {
  default: 'surface-card',
  inverted: 'surface-card-inverted',
};

const roundedClassName: Record<'lg' | 'md', string> = {
  lg: 'rounded-[2.5rem]',
  md: 'rounded-[2.2rem]',
};

export default function Card({
  variant = 'default',
  interactive = false,
  rounded = 'lg',
  as: Tag = 'div',
  className = '',
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`${roundedClassName[rounded]} p-6 border shadow-xl ${variantClassName[variant]} ${
        interactive ? 'focus-within:ring-2 focus-within:ring-focus-ring transition-all' : ''
      } ${className}`}
      {...rest}
    />
  );
}
