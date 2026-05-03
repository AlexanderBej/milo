import { useEffect } from "react";

import { useAppDispatch } from "@app/hooks";
import { setNowIso } from "./timeSlice";

const TICK_MS = 60_000;

export const TimeEngine = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateNow = () => {
      dispatch(setNowIso(new Date().toISOString()));
    };

    updateNow();

    const timer = window.setInterval(updateNow, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [dispatch]);

  return null;
};
