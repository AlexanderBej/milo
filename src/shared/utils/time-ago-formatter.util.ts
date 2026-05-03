import { formatRelativeTime } from "@features/time/timeUtils";

export function formatTimeAgo(dateString: string): string {
  return formatRelativeTime(dateString, new Date());
}
