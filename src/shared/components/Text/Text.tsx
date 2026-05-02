import type { ElementType, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import styles from './Text.module.scss';

type TextElement = 'h1' | 'h2' | 'h3' | 'p' | 'span';
type TextVariant = 'heading' | 'title' | 'body' | 'small' | 'meta';
type TextTone = 'primary' | 'secondary' | 'muted';

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: TextVariant;
  tone?: TextTone;
};

export function Text({
  as = 'p',
  variant = 'body',
  tone = 'primary',
  className,
  children,
  ...props
}: TextProps) {
  const Component = as as ElementType;

  return (
    <Component className={clsx(styles.text, styles[variant], styles[tone], className)} {...props}>
      {children}
    </Component>
  );
}
