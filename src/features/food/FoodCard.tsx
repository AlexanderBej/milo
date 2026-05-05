import { ForkKnife } from "phosphor-react";
import clsx from "clsx";

import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";

import styles from "../home/cards/cards.module.scss";

type FoodCardProps = {
  className?: string;
};

export const FoodCard: React.FC<FoodCardProps> = ({ className }) => {
  return (
    <Card
      className={clsx(className)}
      color="--color-accent-flame"
      icon={<ForkKnife weight="duotone" />}
      title="Food"
    >
      <div className={styles.integrationPlaceholder}>
        <div className={styles.messageStack}>
          <h3>Food planning isn’t connected yet.</h3>
          <p>
            Later, MILO will help surface meal plans, grocery needs, and gentle
            food reminders.
          </p>
        </div>
        <Button disabled size="sm" variant="secondary">
          Coming later
        </Button>
      </div>
    </Card>
  );
};

// TODO: Connect food planning when the source of truth exists:
// next meal, grocery needs, recurring meal ideas, and food reminders.
