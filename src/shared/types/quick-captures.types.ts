export type CaptureItem = {
  id: string;
  content: string;
  createdAt: string;
  processed: boolean;
  processedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
};
