/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Link } from "react-router-dom";
import { Tray } from "phosphor-react";

import { useAppSelector } from "@app/hooks";
import { Card } from "@shared/components/Card";
import {
  selectUnprocessedCaptureCount,
  selectUnprocessedCaptures,
  selectLatestUnprocessedCapture,
} from "@features/quickCapture";
import { useNow, formatRelativeTime } from "@features/time";

import styles from "../cards.module.scss";

export const InboxCard = () => {
  const captureCount = useAppSelector(selectUnprocessedCaptureCount);
  const captures = useAppSelector(selectUnprocessedCaptures);
  const latestCapture = useAppSelector(selectLatestUnprocessedCapture);
  const now = useNow();
  const visibleCaptures = captures.slice(0, 2);

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/inbox">
          Open Inbox
        </Link>
      }
      icon={<Tray weight="duotone" />}
      title="Inbox"
      color="--color-primary-hover"
    >
      <div className={styles.messageStack}>
        <h3>
          {captureCount > 0
            ? `${captureCount.toString()} ${captureCount === 1 ? "thought is" : "thoughts are"} waiting.`
            : "Your inbox is clear for now."}
        </h3>
        {latestCapture ? (
          <p>
            Latest capture {formatRelativeTime(latestCapture.createdAt, now)}.
          </p>
        ) : (
          <p>Capture a thought whenever something starts waiting.</p>
        )}
        {visibleCaptures.length > 0 ? (
          <ul className={styles.boardPreviewList}>
            {visibleCaptures.map((capture) => (
              <li key={capture.id}>
                {capture.content} · {formatRelativeTime(capture.createdAt, now)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
};
