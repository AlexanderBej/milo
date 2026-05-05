import { Lightning } from "phosphor-react";
import clsx from "clsx";

import { useAppSelector } from "@app/hooks";
import { selectNudgesEnabled } from "@features/preferences";
import { NudgeCard as HomeNudgeCard } from "@features/nudges";
import { Card } from "@shared/components/Card";

import styles from "../cards.module.scss";

type NudgePanelProps = {
  className?: string;
};

export const NudgePanel: React.FC<NudgePanelProps> = ({ className }) => {
  const nudgesEnabled = useAppSelector(selectNudgesEnabled);

  if (nudgesEnabled) {
    return <HomeNudgeCard />;
  }

  return (
    <Card
      icon={<Lightning weight="duotone" />}
      title="Nudges"
      color="--color-accent-teal"
      className={clsx(className)}
    >
      <div className={styles.messageStack}>
        <h3>Nudges are quiet right now.</h3>
        <p>You can turn them back on in Settings.</p>
      </div>
    </Card>
  );
};
