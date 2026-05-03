import styles from "./FocusOrb.module.scss";

export const FocusOrb = () => {
  return (
    <div className={styles.orb} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.ring} />
      <span className={styles.ring} />
      <span className={styles.ring} />

      <span className={styles.core} />
    </div>
  );
};
