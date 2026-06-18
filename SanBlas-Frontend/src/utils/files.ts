import { FILES_BASE_URL } from "../config/api";

export const resolveUploadedFileUrl = (
  storedPath: string | null | undefined,
): string | null => {
  if (!storedPath) return null;
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    return storedPath;
  }

  return `${FILES_BASE_URL}/uploads/${storedPath.replace(/^\//, "")}`;
};
