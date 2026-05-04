import { useEffect } from "react";

import { useAppDispatch } from "@app/hooks";
import { setNowIso } from "./timeSlice";

const TICK_MS = 60_000;

export const TimeEngine = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let timer: number | undefined;

    const updateNow = () => {
      dispatch(setNowIso(new Date().toISOString()));
    };

    const stopTimer = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const startTimer = () => {
      stopTimer();
      updateNow();
      timer = window.setInterval(updateNow, TICK_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
        return;
      }

      startTimer();
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  return null;
};
