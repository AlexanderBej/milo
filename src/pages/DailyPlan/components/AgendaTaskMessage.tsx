import { CheckCircle, X } from "phosphor-react";
import styles from "../DailyPlanPage.module.scss";

export type PlanToast = {
  message: string;
  undo?: () => void;
};

type AgendaTaskMessageProps = {
  message?: string;
  onDismiss: () => void;
  toast: PlanToast | null;
};

export const AgendaTaskMessage = ({
  message,
  onDismiss,
  toast,
}: AgendaTaskMessageProps) => {
  if (!message && !toast) {
    return null;
  }

  return (
    <div className={styles.message} role="status">
      <CheckCircle aria-hidden size={20} weight="fill" />
      <span>{message ?? toast?.message}</span>
      {toast?.undo ? (
        <button
          className={styles.undoButton}
          onClick={() => toast.undo?.()}
          type="button"
        >
          Undo
        </button>
      ) : null}
      <button
        aria-label="Dismiss task message"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden size={18} weight="bold" />
      </button>
    </div>
  );
};
