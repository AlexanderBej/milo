import { Wallet } from "phosphor-react";
import clsx from "clsx";

import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";

import styles from "../cards.module.scss";

type MoneyCardProps = {
  className?: string;
};

export const MoneyCard: React.FC<MoneyCardProps> = ({ className }) => {
  return (
    <Card
      className={clsx(className)}
      color="--color-accent-green"
      icon={<Wallet weight="duotone" />}
      title="Money"
    >
      <div className={styles.integrationPlaceholder}>
        <div className={styles.messageStack}>
          <h3>Money tracking isn’t connected yet.</h3>
          <p>
            Later, MILO will show your remaining budget, daily allowance, and
            recent transactions.
          </p>
        </div>
        <Button disabled size="sm" variant="secondary">
          Coming later
        </Button>
      </div>
    </Card>
  );
};

// TODO: Integrate the money tracker app here when ready:
// remaining total, remaining per day, spent this month, last 4-5 transactions,
// and a link to open the tracker.
