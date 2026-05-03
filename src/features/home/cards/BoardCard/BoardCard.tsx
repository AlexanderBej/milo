import { Link } from "react-router-dom";
import { Chalkboard } from "phosphor-react";

import { useAppSelector } from "@app/hooks";
import { Card } from "@shared/components/Card";
import { selectBoardNotes } from "@features/board";

import styles from "../cards.module.scss";

export const BoardCard = () => {
  const notes = useAppSelector(selectBoardNotes);
  const visibleNotes = notes.slice(-3).reverse();

  return (
    <Card
      actions={
        <Link className={styles.cardTextLink} to="/board">
          Open Board
        </Link>
      }
      icon={<Chalkboard weight="duotone" />}
      title="Board"
    >
      <div className={styles.boardPreview}>
        {notes.length > 0 ? (
          <>
            <p className={styles.planProgress}>
              {notes.length} {notes.length === 1 ? "note" : "notes"} waiting
            </p>
            <ul className={styles.boardPreviewList}>
              {visibleNotes.map((note) => (
                <li key={note.id}>{note.content || "Empty thought"}</li>
              ))}
            </ul>
          </>
        ) : (
          <h3>Drop a thought here. You can organize it later.</h3>
        )}
      </div>
    </Card>
  );
};
