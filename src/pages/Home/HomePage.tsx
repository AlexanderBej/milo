import { useAppSelector } from "@app/hooks";
import { selectAuthDisplayName } from "@features/auth";
import { selectDisplayName } from "@features/preferences";
import { getGreetingForTime, getTimeSlot, useNow } from "@features/time";
import {
  FocusCard,
  DailyPlanCard,
  FoodCard,
  MoneyCard,
  NudgePanel,
  BoardCard,
  InboxCard,
  RoutinesCard,
} from "@features/home/cards";

import styles from "./HomePage.module.scss";
import { EmblaCarousel } from "@shared/components/EmblaCarousel";

const homeCopyByTimeSlot = {
  morning: "Want to set the tone for today?",
  afternoon: "Need a small win?",
  evening: "Want to close the day gently?",
  night: "Let’s keep this light.",
} as const;

export const HomePage = () => {
  return (
    <main className={styles.mainContent}>
      <HomeHeader />
      <FocusCard />
      <section className={styles.supportingGrid} aria-label="Today overview">
        <DailyPlanCard className={styles.dailyPlanCard} />
        <RoutinesCard className={styles.routinesCard} />
        <NudgePanel className={styles.nudgePanel} />
        <EmblaCarousel className={styles.carousel}>
          <InboxCard className={styles.inboxCard} />
          <BoardCard className={styles.boardCard} />
        </EmblaCarousel>
        <MoneyCard className={styles.moneyCard} />
        <FoodCard className={styles.foodCard} />
      </section>
    </main>
  );
};

const HomeHeader = () => {
  const authDisplayName = useAppSelector(selectAuthDisplayName);
  const preferenceDisplayName = useAppSelector(selectDisplayName);
  const now = useNow();
  const greetingName =
    authDisplayName.trim() || preferenceDisplayName.trim() || null;
  const greeting = greetingName
    ? `${getGreetingForTime(now)}, ${greetingName}`
    : getGreetingForTime(now);

  return (
    <header className={styles.header}>
      <div>
        <h1>{greeting}</h1>
        <p>{homeCopyByTimeSlot[getTimeSlot(now)]}</p>
      </div>
    </header>
  );
};
