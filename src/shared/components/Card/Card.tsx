import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import styles from "./Card.module.scss";
import { getCssVar } from "@shared/utils";

export type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const Card = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  color,
  ...props
}: CardProps) => {
  const hasHeader = title || icon || actions || subtitle;

  const iconColor = color
    ? getCssVar(color)
    : getCssVar("--color-primary-hover");
  const titleColor = color
    ? getCssVar(color)
    : getCssVar("--color-text-primary");

  return (
    <section className={clsx(styles.card, className)} {...props}>
      {hasHeader ? (
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconGroup}>
              {icon ? (
                <span className={styles.icon} style={{ color: iconColor }}>
                  {icon}
                </span>
              ) : null}
              {title ? (
                <h2 className={styles.title} style={{ color: titleColor }}>
                  {title}
                </h2>
              ) : null}
            </div>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
};
