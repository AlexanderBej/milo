import { useEffect, useRef, useState } from "react";
import { X } from "phosphor-react";
import { useAppDispatch } from "@app/hooks";
import { Button } from "@shared/components/Button";
import { addCapture } from "../quickCaptureSlice";
import styles from "./QuickCaptureModal.module.scss";

type QuickCaptureModalProps = {
  isOpen: boolean;
  onCaptured: () => void;
  onClose: () => void;
};

export const QuickCaptureModal = ({
  isOpen,
  onCaptured,
  onClose,
}: QuickCaptureModalProps) => {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedContent = content.trim();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleSave() {
    if (!trimmedContent) {
      return;
    }

    dispatch(addCapture(trimmedContent));
    setContent("");
    onClose();
    onCaptured();
  }

  function handleClose() {
    setContent("");
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <button
        aria-label="Close quick capture"
        className={styles.backdropButton}
        onClick={handleClose}
        type="button"
      />
      <section
        aria-labelledby="quick-capture-title"
        aria-modal="true"
        className={styles.sheet}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Quick Capture</p>
            <h2 id="quick-capture-title">What needs your attention?</h2>
          </div>
          <Button
            aria-label="Close quick capture"
            icon={<X />}
            onClick={handleClose}
            variant="ghost"
          />
        </header>

        <textarea
          aria-label="Capture thought"
          className={styles.textarea}
          onChange={(event) => {
            setContent(event.target.value);
          }}
          placeholder="Drop the thought here..."
          ref={textareaRef}
          rows={6}
          value={content}
        />

        <footer className={styles.footer}>
          <Button onClick={handleClose} variant="ghost">
            Cancel
          </Button>
          <Button disabled={!trimmedContent} onClick={handleSave}>
            Save
          </Button>
        </footer>
      </section>
    </div>
  );
};
