import { clsx } from "clsx";
import styles from "./OptionChipGroup.module.scss";

export type OptionChip<TValue extends string> = {
  label: string;
  value: TValue;
};

type OptionChipGroupProps<TValue extends string> = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<OptionChip<TValue>>;
  tabIndex?: number;
  value: TValue;
};

export const OptionChipGroup = <TValue extends string>({
  ariaLabel,
  className,
  disabled = false,
  onChange,
  options,
  tabIndex,
  value,
}: OptionChipGroupProps<TValue>) => {
  return (
    <div
      className={clsx(styles.group, className)}
      aria-label={ariaLabel}
      role="group"
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            aria-pressed={isSelected}
            className={clsx(styles.chip, isSelected && styles.chipActive)}
            disabled={disabled}
            key={option.value}
            onClick={() => {
              onChange(option.value);
            }}
            tabIndex={tabIndex}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
