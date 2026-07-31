import Link from 'next/link';
import { MouseEventHandler, ReactNode } from 'react';

interface IconButtonBaseProps {
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  className?: string;
}

interface IconButtonAsLink extends IconButtonBaseProps {
  href: string;
  onClick?: undefined;
  disabled?: undefined;
}

interface IconButtonAsButton extends IconButtonBaseProps {
  href?: undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

type IconButtonProps = IconButtonAsLink | IconButtonAsButton;

const variantClassName: Record<'default' | 'danger', string> = {
  default: 'text-card-muted-fg hover:text-card-fg hover:bg-muted-bg',
  danger: 'text-danger-muted-fg hover:text-danger hover:bg-danger-muted-bg',
};

export default function IconButton(props: IconButtonProps) {
  const { icon, label, variant = 'default', className = '' } = props;
  const sharedClassName = `p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${variantClassName[variant]} ${className}`;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} aria-label={label} title={label} className={sharedClassName}>
        {icon}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={label}
      title={label}
      className={sharedClassName}
    >
      {icon}
    </button>
  );
}
