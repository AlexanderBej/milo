import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      type={type}
      {...props}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children ? <span className={styles.label}>{children}</span> : null}
    </button>
  );
}
