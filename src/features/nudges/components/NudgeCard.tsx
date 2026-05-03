import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { Coffee, X } from "phosphor-react";

import { useAppSelector } from "@app/hooks";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { getTimeSlot, useNow } from "@features/time";
import { selectNudges } from "../selectors";
import styles from "./NudgeCard.module.scss";

const STORAGE_KEY = "milo:nudges:hidden";

const readHiddenNudgeIds = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const writeHiddenNudgeIds = (ids: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const quietContextByTimeSlot = {
  morning: "MILO will speak up if something useful is waiting.",
  afternoon: "A small next step will surface here when it helps.",
  evening: "MILO will keep this gentle as the day winds down.",
  night: "MILO will keep things light unless something needs attention.",
} as const;

export const NudgeCard = () => {
  const navigate = useNavigate();
  const now = useNow();
  const nudges = useAppSelector(selectNudges);
  const [hiddenIds, setHiddenIds] = useState<string[]>(readHiddenNudgeIds);
  const hiddenIdSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const nudge = nudges.find((item) => !hiddenIdSet.has(item.id));

  const hideNudge = () => {
    if (!nudge) {
      return;
    }

    setHiddenIds((currentIds) => {
      if (currentIds.includes(nudge.id)) {
        return currentIds;
      }

      const nextIds = [...currentIds, nudge.id];
      writeHiddenNudgeIds(nextIds);

      return nextIds;
    });
  };

  if (!nudge) {
    return (
      <Card icon={<Coffee weight="duotone" />} title="Nudges">
        <div className={styles.nudgeBody}>
          <div className={styles.messageStack}>
            <h3 className={styles.message}>No nudges right now.</h3>
            <p className={styles.context}>
              {quietContextByTimeSlot[getTimeSlot(now)]}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card icon={<Coffee weight="duotone" />} title="Nudges">
      <div
        className={clsx(
          styles.nudgeBody,
          nudge.type === "routine" && styles.routineNudge,
        )}
      >
        <div className={styles.messageStack}>
          <h3 className={styles.message}>{nudge.message}</h3>
          {nudge.context ? (
            <p className={styles.context}>{nudge.context}</p>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              void navigate(nudge.primaryAction.route);
            }}
            size="sm"
            variant="secondary"
          >
            {nudge.primaryAction.label}
          </Button>
          <Button onClick={hideNudge} size="sm" variant="ghost">
            Later
          </Button>
          <Button icon={<X />} onClick={hideNudge} size="sm" variant="ghost">
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
};
