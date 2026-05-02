import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Card.module.scss';

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function Card({ title, icon, actions, children, className, ...props }: CardProps) {
  const hasHeader = title || icon || actions;

  return (
    <section className={clsx(styles.card, className)} {...props}>
      {hasHeader ? (
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            {title ? <h2 className={styles.title}>{title}</h2> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
