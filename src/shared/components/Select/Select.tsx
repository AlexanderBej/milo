import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";
import styles from "./Select.module.scss";

type SelectVariant = "field" | "pill";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant;
};

export const Select = ({
  children,
  className,
  variant = "field",
  ...props
}: SelectProps) => {
  return (
    <select
      className={clsx(styles.select, styles[variant], className)}
      {...props}
    >
      {children}
    </select>
  );
};
